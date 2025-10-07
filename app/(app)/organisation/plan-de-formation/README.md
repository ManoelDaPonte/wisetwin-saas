# 📚 Système de Plan de Formation - Documentation Technique

> **Dernière mise à jour** : 2025-01-07
> **Page** : `/organisation/plan-de-formation`

---

## 🎯 Vue d'ensemble

Le système de plan de formation permet aux **OWNER** et **ADMIN** d'une organisation de :
1. Créer des **Plans** (tags) de formation avec échéances et priorités
2. Assigner ces plans à des **Membres** de l'organisation
3. Assigner des **Formations** (builds Unity) à ces plans
4. Suivre la **Progression** des membres dans leur parcours de formation

---

## 🏗️ Architecture du Système

### Modèle de données (3 entités principales)

```
┌─────────────────┐
│  TrainingTag    │  ← Plan de formation (ex: "Sécurité niveau 1")
│  (Plan)         │
└────────┬────────┘
         │
         ├── 1:N ──→ MemberTag (Assignation membre ↔ plan)
         │
         └── 1:N ──→ BuildTag (Assignation formation ↔ plan)
```

#### 1. **TrainingTag** (Table: `TrainingTag`)
- Représente un **plan de formation**
- Propriétés : `name`, `color`, `description`, `dueDate`, `priority` (HIGH/MEDIUM/LOW)
- Appartient à une `organizationId`

#### 2. **MemberTag** (Table: `MemberTag`)
- Lie un **membre** à un **plan**
- Propriétés : `userId`, `tagId`, `assignedById`, `createdAt`
- Permet de savoir quels membres doivent suivre quels plans

#### 3. **BuildTag** (Table: `BuildTag`)
- Lie une **formation Unity** à un **plan**
- Propriétés : `buildName`, `buildType`, `containerId`, `tagId`, `assignedById`
- Permet de savoir quelles formations font partie de quels plans

---

## 📊 Flux de Données

### Page principale : `page.tsx`

```typescript
Sources de données :
  ├── activeOrganization (Zustand store)
  └── 4 onglets (Tabs)
       ├── Dashboard      → ProgressDashboard
       ├── Plans (1)      → TagsManager
       ├── Membres (2)    → MemberTagsManager
       └── Formations (3) → BuildsManager
```

### Workflow typique d'utilisation

```
ÉTAPE 1: Créer des Plans
  ├── Onglet "Gérer mes Plans"
  ├── Hook: useTrainingTags()
  ├── API: POST /api/training-management/tags
  └── Résultat: Nouveaux plans créés en DB

ÉTAPE 2: Assigner des Membres aux Plans
  ├── Onglet "Associer les membres"
  ├── Hook: useMemberTags() + useMembers()
  ├── API: POST /api/training-management/member-tags (bulk)
  └── Résultat: Relations MemberTag créées

ÉTAPE 3: Assigner des Formations aux Plans
  ├── Onglet "Associer les formations"
  ├── Hook: useBuildTags() + useBuilds()
  ├── API: POST /api/training-management/build-tags (bulk)
  └── Résultat: Relations BuildTag créées

ÉTAPE 4: Suivre la Progression
  ├── Onglet "Tableau de bord"
  ├── Hook: useTrainingDashboard() + useTrainingAnalytics()
  ├── APIs:
  │   ├── GET /api/training-management/member-completions
  │   └── GET /api/training-analytics
  └── Résultat: Vue consolidée de la progression
```

---

## 🔗 Hooks Principaux

### 1. `use-training-system.ts`
**Hook central** qui orchestre tout le système.

```typescript
useTrainingSystem() → {
  // Données brutes
  tags: TrainingTag[]
  members: Member[]
  memberTags: MemberTag[]

  // Données enrichies avec stats
  tagsWithStats: TagWithStats[]
  membersWithStats: MemberWithStats[]
  systemStats: SystemStats

  // Helpers
  getTagById()
  getMemberById()
  getTagMembers()
  getMemberTags()
}
```

**Sources de données** :
- `useTrainingTags()` → Tous les plans de l'organisation
- `useMemberTags()` → Toutes les assignations membre↔plan
- `useMembers()` → Tous les membres de l'organisation

### 2. `use-training-tags.ts`
Gestion des **Plans de formation**.

```typescript
useTrainingTags() → Récupère tous les plans
useCreateTrainingTag() → Crée un nouveau plan
useUpdateTrainingTag() → Modifie un plan
useDeleteTrainingTag() → Supprime un plan
```

**API Backend** : `/api/training-management/tags`

### 3. `use-member-tags.ts`
Gestion des **Assignations membre ↔ plan**.

```typescript
useMemberTags() → Récupère toutes les assignations
useBulkAssignTags() → Assigne plusieurs membres à plusieurs plans
useBulkRemoveTags() → Retire plusieurs assignations
```

**API Backend** : `/api/training-management/member-tags`

### 4. `use-build-tags.ts`
Gestion des **Assignations formation ↔ plan**.

```typescript
useBuildsWithTags() → Récupère toutes les formations avec leurs plans
useBulkAssignBuildTags() → Assigne plusieurs formations à plusieurs plans
useBulkRemoveBuildTags() → Retire plusieurs assignations
```

**API Backend** : `/api/training-management/build-tags`

**Important** : Ce hook combine :
- Données Azure (formations Unity) via `useBuilds("wisetrainer")`
- Données PostgreSQL (assignations) via `fetchBuildTags()`

### 5. `use-training-analytics.ts`
Suivi de la **Progression réelle** des membres.

```typescript
useTrainingAnalytics() → {
  analytics: TrainingAnalytics[] // Sessions de formation
  aggregates: {
    totalSessions
    averageDuration
    averageSuccessRate
  }
}
```

**API Backend** : `/api/training-analytics`
**Source** : Table `TrainingAnalytics` (données envoyées par Unity)

### 6. `use-member-completions.ts`
**Pont entre le système de plans et les completions réelles**.

```typescript
useMemberCompletions() → {
  completions: Map<memberId, Set<buildName>> // Formations terminées par membre
}
```

**API Backend** : `/api/training-management/member-completions`
**Logique** : Récupère les formations avec `completionStatus === "COMPLETED"` depuis `TrainingAnalytics`

---

## 🌐 APIs Backend

### Routes `/api/training-management/`

| Route | Méthode | Description | Body/Params |
|-------|---------|-------------|-------------|
| `/tags` | GET | Liste des plans | `?organizationId=xxx` |
| `/tags` | POST | Créer un plan | `{ name, color, description, dueDate, priority }` |
| `/tags/[tagId]` | PUT | Modifier un plan | `{ name?, color?, ... }` |
| `/tags/[tagId]` | DELETE | Supprimer un plan | `?organizationId=xxx` |
| `/member-tags` | GET | Assignations membre↔plan | `?organizationId=xxx&userId?=&tagId?=` |
| `/member-tags` | POST | Assigner (bulk) | `{ userIds: [], tagIds: [] }` |
| `/member-tags` | DELETE | Retirer (bulk) | `{ userIds: [], tagIds: [] }` |
| `/build-tags` | GET | Assignations formation↔plan | `?organizationId=xxx&tagId?=` |
| `/build-tags` | POST | Assigner (bulk) | `{ buildIds: [], tagIds: [] }` |
| `/build-tags` | DELETE | Retirer (bulk) | `{ buildIds: [], tagIds: [] }` |
| `/member-completions` | GET | Formations terminées | `?organizationId=xxx` |

### Route `/api/training-analytics`

| Route | Méthode | Description | Params |
|-------|---------|-------------|--------|
| `/training-analytics` | GET | Analytics de formation | `?organizationId=xxx&buildType?=WISETRAINER` |

**Source de données** : Table `TrainingAnalytics` (remplie par Unity WebGL)

---

## 🎨 Composants Principaux

### `TagsManager.tsx` (Étape 1)
- Créer/Modifier/Supprimer des plans
- Affichage en cartes avec couleurs et priorités
- Hooks : `useTrainingTagsManager()`

### `MemberTagsManager.tsx` (Étape 2)
- Tableau des membres avec leurs plans assignés
- Sélection multiple pour assignation bulk
- Hooks : `useMemberTagsManager()`

### `BuildsManager.tsx` (Étape 3)
- Tableau des formations avec leurs plans assignés
- Filtrage par tag
- Sélection multiple pour assignation bulk
- Hooks : `useBuildsWithTags()`, `useTrainingTags()`

### `ProgressDashboard.tsx` (Tableau de bord)
- Vue d'ensemble des métriques
- Liste des plans avec progression
- Détail par membre (formations terminées/en cours)
- Hooks : `useTrainingDashboard()`, `useTrainingAnalytics()`, `useBuildsWithTags()`

---

## 🔄 Synchronisation des Données

### React Query - Clés de cache

```typescript
["training-tags", organizationId]           // Plans
["member-tags", organizationId]             // Assignations membre↔plan
["build-tags", organizationId]              // Assignations formation↔plan
["builds", containerId, "wisetrainer"]      // Formations Unity
["members", organizationId]                 // Membres
["training-analytics", organizationId]      // Analytics
["member-completions", organizationId]      // Completions
```

### Invalidation en cascade

Quand un plan est modifié :
```typescript
invalidateQueries(["training-tags"])
  → Met à jour TagsManager
  → Met à jour ProgressDashboard
  → Met à jour les stats dans tous les composants
```

Quand une assignation est créée :
```typescript
invalidateQueries(["member-tags"]) ou ["build-tags"]
  → Met à jour les tableaux
  → Met à jour les compteurs de membres/formations
  → Met à jour le dashboard
```

---

## ⚠️ Points d'Attention

### 1. Isolation par Organisation
**Toutes les requêtes** sont filtrées par `organizationId` :
- Côté client : `useOrganizationStore()` fournit l'organisation active
- Côté serveur : Vérification dans chaque route API avec `withOrgAuth()`

### 2. Permissions
- **OWNER** : Tous les droits (créer/modifier/supprimer)
- **ADMIN** : Créer/modifier (pas supprimer les plans)
- **MEMBER** : Aucun accès à cette page (redirection)

### 3. Double Source de Données
Les **formations** viennent de deux sources :
1. **Azure Blob Storage** : Fichiers Unity WebGL (métadonnées, images)
2. **PostgreSQL** : Assignations aux plans (BuildTag)

Le hook `useBuildsWithTags()` **merge** ces deux sources.

### 4. Analytics vs Completions
- **TrainingAnalytics** : Données détaillées (sessions, interactions, scores)
- **BuildTag.completions** : Vue simplifiée (terminé/en cours) pour le système de plans

---

## 🐛 Problèmes Résolus

### ✅ Fix: Disparition des assignations formations→tags (2025-01-07)

**Problème** : Les assignations de formations aux plans disparaissaient aléatoirement quand on revenait sur la page. Un refresh résolvait le problème.

**Cause racine** :
- Le hook `useBuildsWithTags()` utilisait `useQuery` avec une clé de cache qui ne capturait pas les changements dans `buildTags` et `tags`
- Quand une assignation était créée, `buildTags` se rechargeait mais `builds-with-tags` restait avec des données obsolètes
- La clé de cache `["builds-with-tags", orgId, containerId]` ne changeait pas malgré les mises à jour des données sous-jacentes

**Solution** :
1. Remplacement de `useQuery` par `useMemo` dans `useBuildsWithTags()` car c'est un **calcul dérivé** de données déjà en cache
2. Ajout de `refetchOnMount: true` dans `useBuildTags()` pour forcer le rechargement à chaque montage
3. Réduction du `staleTime` à 1 minute pour plus de réactivité

**Résultat** : Les assignations se mettent maintenant à jour en temps réel grâce aux dépendances `useMemo` qui détectent automatiquement les changements.

---

## 🐛 Problèmes Connus / À Implémenter

### TODO
- [ ] Système de notifications par email (échéances approchant)
- [ ] Export des données de progression (CSV/PDF)
- [ ] Filtres avancés dans le dashboard
- [ ] Graphiques de progression dans le temps
- [ ] Gestion des rappels automatiques
- [ ] Support multi-buildType (WiseTour + WiseTrainer)

---

## 📖 Ressources

### Schéma de Base de Données
Voir : `/prisma/schema.prisma`
```prisma
model TrainingTag { ... }
model MemberTag { ... }
model BuildTag { ... }
model TrainingAnalytics { ... }
```

### Types TypeScript
Voir : `/types/training.ts`

### Validators Zod
Voir : `/validators/training.ts`

---

## 🤝 Support

Pour toute question sur le système de plans de formation :
1. Vérifier cette documentation
2. Consulter les types dans `/types/training.ts`
3. Vérifier les logs dans la console (mode développement)
4. Utiliser React Query Devtools pour inspecter le cache
