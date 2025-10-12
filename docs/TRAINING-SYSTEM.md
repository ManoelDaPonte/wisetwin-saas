# Système de Formation et Certification WiseTwin

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Système de certification](#système-de-certification)
3. [Activité récente](#activité-récente)
4. [Architecture technique](#architecture-technique)
5. [Flux de données](#flux-de-données)
6. [API et Hooks](#api-et-hooks)
7. [Statistiques utilisateur](#statistiques-utilisateur)

## Vue d'ensemble

Le système de formation WiseTwin permet aux utilisateurs de suivre des formations Unity WebGL (WiseTour et WiseTrainer) avec un suivi complet de leur progression, des scores obtenus et la délivrance de certifications.

### Principales fonctionnalités

- **Suivi de l'activité** : Historique complet des formations suivies
- **Système de scores** : Évaluation de la performance avec scores en pourcentage
- **Certifications** : Attribution automatique pour les formations réussies (score ≥ 80%)
- **Visualisation enrichie** : Images des formations avec système de fallback
- **Statistiques détaillées** : Temps passé, scores moyens, nombre de formations

## Système de certification

### Critères de certification

Une formation est considérée comme **certifiée** lorsque :
- Le score obtenu est **≥ 80%**
- La formation a été complétée jusqu'au bout
- Il s'agit d'une formation de type **WiseTrainer**

### Règles importantes

1. **Unicité de la certification** : Une seule certification est attribuée par formation, correspondant au **meilleur score obtenu**
2. **Tentatives multiples** : Un utilisateur peut refaire une formation plusieurs fois
3. **Historique complet** : Toutes les tentatives sont conservées dans l'activité récente
4. **Score affiché** : Si plusieurs tentatives ont le même meilleur score, la plus récente est retenue

### Visualisation des certifications

```typescript
// Page : app/(app)/tableau-de-bord/certifications/page.tsx

// Structure d'une certification
interface CertifiedFormation {
  build: {
    id?: string;
    name: string;
    buildType?: string;
    metadata?: {
      title?: string | { en: string; fr: string };
      imageUrl?: string;
      [key: string]: unknown;
    };
    imageUrl?: string;
  };
  score: number;          // Score obtenu (≥ 80%)
  completedAt: string;    // Date de certification
  isFirstSuccess: boolean; // Indicateur si c'était la première réussite
}
```

### Affichage visuel

- **Image de la formation** : Affichée en miniature (40x40px)
- **Fallback** : Icône FileCode si aucune image disponible
- **Badge de réussite** : Icône Trophy dorée pour les certifications
- **Code couleur des scores** :
  - Vert : Score ≥ 80% (certifié)
  - Jaune : Score entre 60% et 80%
  - Rouge : Score < 60%

## Activité récente

### Données affichées

La page d'activité récente (`app/(app)/tableau-de-bord/activite-recente/page.tsx`) affiche :

1. **Image de la formation**
   - Miniature de la formation
   - Fallback sur icône FileCode

2. **Nom de la formation**
   - Titre localisé (FR/EN)
   - Badge indiquant le type (WiseTrainer/WiseTour)

3. **Score obtenu**
   - Pourcentage avec code couleur
   - Icône Trophy pour les scores ≥ 80%
   - Tiret (-) si pas de score disponible

4. **Date et heure**
   - Format complet : "12 janvier 2025 à 14:30"
   - Temps relatif : "il y a 2 heures"

### Tri et filtrage

- **Tri disponible** :
  - Par nom de formation
  - Par score obtenu
  - Par date (défaut : plus récent en premier)

- **Recherche** : Par nom de formation

- **Pagination** : 10 éléments par page

## Architecture technique

### Structure des données

```typescript
// Types enrichis pour l'activité
export interface RecentActivity {
  id: string;
  type: 'completion';
  buildName: string;
  buildType: 'wisetrainer' | 'wisetour';
  timestamp: string;
  score?: number;      // Score obtenu (nouveau)
  imageUrl?: string;   // URL de l'image (nouveau)
}
```

### Base de données (Prisma)

```prisma
model UserBuild {
  id          String    @id @default(cuid())
  userId      String
  buildName   String
  buildType   BuildType
  containerId String
  progress    Float     @default(0)
  completed   Boolean   @default(false)
  completedAt DateTime?
  // ...
}

model TrainingAnalytics {
  id                String   @id @default(cuid())
  sessionId         String   @unique
  userId            String
  buildName         String
  buildType         BuildType
  successRate       Float    // Score en pourcentage
  completionStatus  CompletionStatus
  // ...
}
```

## Flux de données

### 1. Récupération des scores

```
Unity WebGL → API Unity → TrainingAnalytics → API Stats → Frontend
```

1. **Unity WebGL** : Envoie les données de session avec scores
2. **API Unity** : Stocke dans `TrainingAnalytics`
3. **API Stats** : Récupère et agrège les données
4. **Frontend** : Affiche avec enrichissement (images, métadonnées)

### 2. Enrichissement des données

```typescript
// Hook: use-recent-activity-with-details.ts

// Étapes d'enrichissement :
1. Récupération activité de base (API Stats)
2. Récupération métadonnées builds (API Builds)
3. Fusion des données :
   - Titre localisé
   - Image URL
   - Score
   - Métadonnées complètes
```

## API et Hooks

### API modifiées

#### `/api/user/stats`
```typescript
// Nouvelles fonctionnalités :
- Map des scores par build
- Association score-activité
- Retour du meilleur score par formation
```

### Nouveaux Hooks

#### `use-certified-formations.ts`
```typescript
function useCertifiedFormations() {
  // Retourne uniquement les formations certifiées (score ≥ 80%)
  // Sélectionne le meilleur score par formation
  // Si scores identiques, prend le plus récent
  // Enrichit avec les données complètes des builds

  return {
    certifications: CertifiedFormation[],
    isLoading: boolean,
    error: Error | null
  };
}
```

### Hooks modifiés

#### `use-recent-activity-with-details.ts`
```typescript
// Enrichissement avec :
- imageUrl des builds
- Scores depuis l'API stats
- Métadonnées localisées
```

## Statistiques utilisateur

### Métriques disponibles

1. **Total formations complétées** : Toutes formations confondues
2. **Formations WiseTrainer** : Nombre de formations d'entraînement
3. **Visites WiseTour** : Nombre de visites virtuelles
4. **Temps total passé** : En heures
5. **Score moyen** : Moyenne de tous les scores obtenus
6. **Activité récente** : 10 dernières formations avec scores

### Calcul des statistiques

```typescript
// API: /api/user/stats/route.ts

// Score moyen
const averageScore = trainingAnalytics.length > 0
  ? trainingAnalytics.reduce((sum, a) => sum + a.successRate, 0) / trainingAnalytics.length
  : 0;

// Temps total (en heures)
const totalTimeSpent = totalTimeSpentSeconds / 3600;

// Activité récente : TOUTES les tentatives depuis TrainingAnalytics
const allAnalytics = await prisma.trainingAnalytics.findMany({
  where: { userId, containerId },
  orderBy: { endTime: 'desc' },
  take: 50
});

// Retourne toutes les activités, y compris les duplications
const recentActivity = allAnalytics.slice(0, 10).map(analytics => ({
  buildName: analytics.buildName,
  score: analytics.successRate,
  timestamp: analytics.endTime
}));
```

## Points d'optimisation

### Performance

1. **Mise en cache React Query**
   - `staleTime: 5 minutes`
   - `gcTime: 10 minutes`
   - Invalidation sélective

2. **Requêtes parallèles**
   - Récupération simultanée des builds et analytics
   - Fusion côté client

3. **Lazy loading des images**
   - Next.js Image component
   - Optimisation automatique

### Sécurité

1. **Isolation des données**
   - Filtrage par `containerId`
   - Vérification des permissions

2. **Validation**
   - Types TypeScript stricts
   - Validation Zod des entrées

## Améliorations futures possibles

1. **Export PDF des certifications**
   - Génération de certificats officiels
   - QR code de vérification

2. **Badges et récompenses**
   - Système de gamification
   - Jalons de progression

3. **Analytics avancés**
   - Graphiques de progression
   - Comparaison avec la moyenne

4. **Notifications**
   - Rappels de formation
   - Félicitations pour certification

## Différences clés

### Mon Activité vs Certifications

| Aspect | Mon Activité | Certifications |
|--------|--------------|----------------|
| **Données affichées** | TOUTES les tentatives | Une par formation (meilleur score) |
| **Source** | TrainingAnalytics (toutes sessions) | TrainingAnalytics (filtré ≥ 80%) |
| **Duplications** | Oui, toutes visibles | Non, dédupliqué |
| **Score minimum** | Aucun | 80% |
| **Tri par défaut** | Plus récent | Plus récent |

## Conclusion

Le système de formation et certification WiseTwin offre une expérience complète de suivi et de validation des compétences. L'architecture modulaire et les hooks optimisés garantissent des performances optimales tout en maintenant une séparation claire des responsabilités.

### Points clés à retenir

- **Score minimum de 80%** pour la certification
- **Une seule certification** par formation (meilleur score obtenu)
- **Historique complet** dans l'activité récente (toutes les tentatives)
- **Images avec fallback** pour une meilleure UX
- **Code couleur** pour visualisation rapide des performances