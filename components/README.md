# Organisation des Composants

Ce dossier contient tous les composants React de l'application. L'organisation suit une structure modulaire pour faciliter la maintenance et la scalabilité.

## Structure des Dossiers

```
components/
├── ui/                    # Composants UI de base et réutilisables
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── layout/               # Composants de mise en page
│   ├── app-sidebar.tsx
│   └── team-switcher.tsx
├── navigation/           # Composants de navigation
│   ├── nav-main.tsx
│   ├── nav-projects.tsx
│   └── nav-user.tsx
├── auth/                 # Composants liés à l'authentification
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── logout-button.tsx
└── features/            # Composants spécifiques aux fonctionnalités
```

## Conventions

### 1. Nommage des Fichiers
- Utiliser le kebab-case pour les noms de fichiers (ex: `login-form.tsx`)
- Les noms doivent être descriptifs et refléter la fonction du composant
- Pour les composants UI de base, utiliser des noms courts et génériques (ex: `button.tsx`, `input.tsx`)

### 2. Organisation des Composants
- **ui/**: Composants de base réutilisables (boutons, inputs, cards, etc.)
- **layout/**: Composants qui définissent la structure de la page
- **navigation/**: Composants liés à la navigation et au menu
- **auth/**: Composants liés à l'authentification
- **features/**: Composants spécifiques à des fonctionnalités métier

### 3. Bonnes Pratiques
- Chaque composant doit être dans son propre fichier
- Utiliser des composants fonctionnels avec TypeScript
- Documenter les props avec des interfaces TypeScript
- Suivre les conventions de nommage React (PascalCase pour les composants)
- Éviter la duplication de code en utilisant les composants UI de base

### 4. Imports
- Utiliser des imports absolus depuis la racine du projet
- Éviter les imports circulaires
- Regrouper les imports par type (React, composants, hooks, etc.)

## Exemple de Structure de Composant

```typescript
import { FC } from 'react'
import { Button } from '@/components/ui/button'

interface MyComponentProps {
  title: string
  onClick: () => void
}

export const MyComponent: FC<MyComponentProps> = ({ title, onClick }) => {
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onClick}>Click me</Button>
    </div>
  )
}
```

## Ajout de Nouveaux Composants

1. Identifier la catégorie appropriée pour le nouveau composant
2. Créer le fichier avec un nom descriptif en kebab-case
3. Implémenter le composant en suivant les conventions ci-dessus
4. Ajouter les types TypeScript appropriés
5. Documenter les props et l'utilisation du composant

## Maintenance

- Maintenir la cohérence dans l'organisation
- Refactoriser les composants qui deviennent trop complexes
- Extraire la logique commune dans des hooks personnalisés
- Utiliser les composants UI de base pour maintenir la cohérence visuelle 