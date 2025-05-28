# Wisetwin SaaS Platform

Wisetwin est une plateforme SaaS innovante qui combine exploration 3D immersive et formation interactive pour offrir une expérience d'apprentissage unique.

## Architecture de l'Application

### Structure des Dossiers

```
├── app/
│   ├── (app)/                    # Routes principales de l'application
│   │   ├── home/                # Page d'accueil
│   │   ├── dashboard/           # Tableau de bord
│   │   ├── wisetwin/           # Exploration 3D
│   │   ├── wisetrainer/        # Formations 3D
│   │   └── organization/        # Gestion de l'organisation
│   ├── (auth)/                  # Routes d'authentification
│   └── api/                     # Routes API
├── components/
│   ├── layout/                  # Composants de mise en page
│   │   ├── app-sidebar.tsx     # Barre latérale principale
│   │   └── organization-switcher.tsx
│   ├── navigation/             # Composants de navigation
│   │   ├── nav-main.tsx        # Navigation principale
│   │   └── nav-user.tsx        # Navigation utilisateur
│   └── ui/                     # Composants UI réutilisables
└── lib/                        # Utilitaires et configurations
```

### Fonctionnalités Principales

#### 1. Navigation
- **Sidebar** : Navigation principale avec les sections suivantes :
  - Home : Page d'accueil et guide de démarrage
  - Dashboard : Suivi de progression
  - Wisetwin : Exploration 3D immersive
  - Wisetrainer : Formations 3D
  - Organization : Gestion de l'organisation

#### 2. Pages Principales

##### Home (`/home`)
- Guide de démarrage pour les nouveaux utilisateurs
- Parcours en 3 étapes :
  1. Exploration de Wisetwin
  2. Suivi des formations Wisetrainer
  3. Suivi de la progression

##### Dashboard (`/dashboard`)
- Vue d'ensemble de la progression
- Suivi des formations en cours
- Statistiques de complétion
- Dernière activité

##### Wisetwin (`/wisetwin`)
- Environnement 3D immersif
- Exploration interactive
- Visualisation des modèles 3D

##### Wisetrainer (`/wisetrainer`)
- Catalogue de formations 3D
- Formations disponibles :
  - Introduction à Wisetwin
  - Formation sécurité
  - Maintenance préventive
- Informations sur la durée et le niveau

##### Organization (`/organization`)
- Gestion des informations de l'organisation
- Gestion des membres
- Rôles et permissions
- Invitation de nouveaux membres

### Composants UI

L'application utilise une bibliothèque de composants UI personnalisée avec :
- Cards pour l'affichage des contenus
- Progress bars pour le suivi
- Buttons pour les actions
- Inputs pour les formulaires
- Sidebar pour la navigation

### Technologies Utilisées

- **Framework** : Next.js
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **UI Components** : Shadcn
- **Icons** : Lucide Icons
- **Authentication** : NextAuth.js

### Points d'Entrée pour les IA Génératives

1. **Génération de Contenu**
   - Pages de formation
   - Descriptions de cours
   - Guides utilisateur

2. **Personnalisation**
   - Adaptation du contenu selon le niveau
   - Recommandations de formation
   - Messages personnalisés

3. **Support**
   - Réponses aux questions
   - Guides d'aide
   - Documentation

4. **Analyse**
   - Suivi de progression
   - Recommandations basées sur les performances
   - Insights sur l'apprentissage

### Développement

Pour démarrer le développement :

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev
```

### Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

### Licence

[À définir selon vos besoins]
