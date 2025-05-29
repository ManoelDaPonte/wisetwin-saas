# Structure Interne de l'Application WiseTwin

## 📁 Organisation des Dossiers

```
app/
├── (app)/                    # Routes principales protégées
│   ├── (features-unity)/     # Features Unity (WiseTrainer, WiseTwin)
│   ├── dashboard/            # Dashboard principal
│   ├── organization/         # Gestion des organisations
│   └── layout.tsx            # Layout avec sidebar
├── (auth)/                   # Routes d'authentification
│   ├── login/                # Page de connexion
│   └── register/             # Page d'inscription
├── api/                      # Routes API Next.js
├── components/               # Composants partagés
├── hooks/                    # Custom hooks
├── stores/                   # Stores Zustand
├── types/                    # Types TypeScript
└── providers.tsx             # Providers globaux
```

## 🪝 Hooks Personnalisés

### `use-azure`
Gère le contexte Azure pour déterminer quel container utiliser.

```typescript
const { containerId, isPersonalSpace, organizationId, isReady } = useAzure();
```

- **containerId**: ID du container actuel (personnel ou organisation)
- **isPersonalSpace**: `true` si espace personnel, `false` si organisation
- **organizationId**: ID de l'organisation active (ou null)
- **isReady**: `true` quand les données sont chargées

### `use-organizations`
Gère les opérations CRUD sur les organisations.

```typescript
const { organizations, loading, error, fetchOrganizations, createOrganization } = useOrganizations();

// Créer une organisation
await createOrganization({ name: "Mon Entreprise", description: "..." });
```

### `use-mobile`
Détecte si l'utilisateur est sur mobile.

```typescript
const isMobile = useIsMobile(); // true si largeur < 768px
```

## 🗃️ Stores (Zustand)

### `organization-store`
Store global pour la gestion des organisations avec persistence.

```typescript
import { useOrganizationStore } from '@/app/stores/organization-store';

// État
const activeOrganization = useOrganizationStore(state => state.activeOrganization);
const organizations = useOrganizationStore(state => state.organizations);

// Actions
const { switchToOrganization, switchToPersonal, addOrganization } = useOrganizationStore();

// Selectors utiles
const isPersonalSpace = useIsPersonalSpace();
const containerId = useCurrentContainerId();
```

## 🧩 Composants

### Layout Components (`/components/layout/`)
- **AppSidebar**: Sidebar principale avec navigation
- **OrganizationSwitcher**: Sélecteur d'organisation/espace personnel
- **CreateOrganizationDialog**: Dialog de création d'organisation

### Navigation Components (`/components/navigation/`)
- **NavMain**: Navigation principale (Dashboard, Organization)
- **NavProjects**: Navigation des projets
- **NavUser**: Menu utilisateur avec déconnexion

### UI Components (`/components/ui/`)
Composants shadcn/ui réutilisables (Button, Card, Dialog, etc.)

## 🔐 Authentification

Le projet utilise NextAuth avec un provider credentials:

```typescript
// app/api/auth/[...nextauth]/route.ts
// Configuration NextAuth avec bcrypt pour les mots de passe
```

## 🏗️ Patterns d'Architecture

### 1. **Route Groups**
- `(app)`: Routes protégées avec sidebar
- `(auth)`: Routes d'authentification
- `(features-unity)`: Features spécifiques Unity

### 2. **State Management**
- **Zustand** pour l'état global (organisations)
- **React Query** implicite dans les hooks (fetching)
- **Context** pour les providers (session)

### 3. **Container Strategy**
- Chaque utilisateur a un container personnel
- Chaque organisation a un container partagé
- Switching automatique selon le contexte

### 4. **Protection des Routes**
Middleware NextAuth qui protège toutes les routes sauf `/login` et `/register`.

## 📦 Modèles de Données (Prisma)

```prisma
User {
  id, email, password, name, hasPersonalContainer
  organizations: OrganizationMember[]
}

Organization {
  id, name, description, hasContainer
  members: OrganizationMember[]
}

OrganizationMember {
  userId, organizationId, role (ADMIN | MEMBER)
}
```

## 🎯 Flux de Travail Typiques

### Création d'Organisation
1. Utilisateur clique sur "Create Organization"
2. Dialog s'ouvre avec formulaire
3. `createOrganization()` crée en DB + container Azure
4. Store Zustand mis à jour
5. UI se rafraîchit automatiquement

### Switch Espace Personnel/Organisation
1. Utilisateur utilise l'OrganizationSwitcher
2. Store Zustand met à jour `activeOrganization`
3. Hook `useAzure` détecte le changement
4. Container ID mis à jour automatiquement
5. Features Unity utilisent le nouveau container

## 🔧 Configuration TypeScript

Le projet utilise TypeScript strict avec:
- Path aliases (`@/` pour la racine)
- Types générés Prisma
- Types NextAuth étendus (`next-auth.d.ts`) 