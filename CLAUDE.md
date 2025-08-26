# WiseTwin SaaS - Guide d'Architecture & Standards

## 🎯 Vue d'ensemble

WiseTwin SaaS est une application multitenant pour la gestion et la distribution de formations Unity WebGL (WiseTour et WiseTrainer). L'application utilise une architecture basée sur Next.js avec un système de sécurité robuste et une gestion d'état centralisée.

## 🏗️ Architecture Technique

### Stack Principal
- **Framework**: Next.js 15.3.2 (App Router)
- **Runtime**: React 19
- **TypeScript**: v5 avec configuration stricte
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: NextAuth.js v4.24.7
- **État global**: Zustand avec persistance
- **Requêtes**: TanStack React Query v5
- **Styling**: Tailwind CSS v4 + Shadcn/UI
- **Validation**: Zod v3.25.32
- **Storage**: Azure Blob Storage
- **Email**: Nodemailer

### Architecture Multitenant

L'application suit un modèle multitenant avec isolation complète :

#### Contexte Global [Organization, User]
- **Store Zustand** (`stores/organization-store.ts`) : gestion centralisée
- **Contexte actuel** : `[activeOrganization, user]`
- **Isolation des données** : chaque organisation a son propre container Azure
- **Sécurité** : tous les accès sont validés par l'auth wrapper

#### Structure de Sécurité
```typescript
// Niveaux d'accès
withAuth() -> Authentification utilisateur uniquement
withOrgAuth() -> Authentification + accès organisation vérifié

// Vérifications automatiques
- Accès aux builds limités à l'organisation
- Validation des permissions (OWNER/ADMIN/MEMBER)  
- Isolation complète des containers Azure
```

## 📁 Structure du Projet

```
/
├── app/                          # App Router Next.js 15
│   ├── (app)/                   # Routes protégées
│   │   ├── (features-unity)/    # Features Unity (WiseTour/WiseTrainer)
│   │   ├── admin/               # Panel d'administration
│   │   ├── organisation/        # Gestion des organisations
│   │   ├── parametres/          # Paramètres utilisateur
│   │   └── layout.tsx           # Layout avec sidebar
│   ├── (auth)/                  # Routes d'authentification
│   ├── api/                     # API Routes
│   ├── components/              # Composants partagés
│   ├── hooks/                   # Hooks globaux
│   └── providers.tsx            # Providers React Query, Session, Theme
│
├── components/                   # Shadcn/UI components
│   └── ui/                      # Base UI components
│
├── lib/                         # Utilitaires et services
│   ├── admin/                   # Services d'administration
│   ├── auth-wrapper.ts          # Middleware de sécurité
│   ├── azure-server.ts          # Client Azure côté serveur
│   └── prisma.ts                # Client Prisma
│
├── stores/                      # Zustand stores
│   └── organization-store.ts    # Store principal [org, user]
│
├── types/                       # Définitions TypeScript
├── validators/                  # Schémas Zod
└── prisma/                     # Schema base de données
```

## 🛡️ Système de Sécurité

### Auth Wrapper (`lib/auth-wrapper.ts`)

**Critère de sécurité majeur** : Toutes les routes API sensibles utilisent l'auth wrapper.

```typescript
// Protection utilisateur simple
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  // request.user disponible avec les données utilisateur
});

// Protection organisation (RECOMMANDÉ pour la plupart des cas)
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  // request.user + request.organization disponibles
  // Vérification automatique des permissions
});
```

### Middleware (`middleware.ts`)
- Protection des routes privées
- Exclusion des API Unity (accès public pour WebGL)
- Headers CORS pour Unity WebGL

### Modèle de Permissions
```typescript
enum Role {
  OWNER   // Propriétaire de l'organisation
  ADMIN   // Administrateur
  MEMBER  // Membre standard
}
```

## 📊 Base de Données (Prisma)

### Modèles Principaux
- **User** : Utilisateurs avec container Azure personnel
- **Organization** : Organisations avec container Azure dédié
- **OrganizationMember** : Relations utilisateur-organisation avec rôles
- **UserBuild** : Suivi des formations et progression
- **OrganizationInvitation** : Système d'invitations avec codes

### Relations Clés
- Un utilisateur appartient à plusieurs organisations
- Chaque organisation a un container Azure unique
- Isolation complète des données par organisation

## 🔄 Gestion d'État

### Zustand Store (`stores/organization-store.ts`)
```typescript
interface OrganizationStore {
  activeOrganization: Organization | null  // Org active
  organizations: Organization[]             // Liste des orgs
  
  // Actions
  switchToOrganization(org: Organization)
  switchToPersonal()
  setOrganizations(orgs: Organization[])
}
```

### React Query Configuration
```typescript
// Configuration globale (app/providers.tsx)
defaultOptions: {
  queries: {
    staleTime: 5 * 60 * 1000,    // 5 minutes
    gcTime: 10 * 60 * 1000,      // 10 minutes  
    retry: 1,
    refetchOnWindowFocus: false,
  }
}
```

### Pattern d'Usage des Hooks
```typescript
// Hook personnalisé avec React Query
export function useBuilds(buildType: BuildType) {
  const { containerId, isReady } = useContainer();
  
  return useQuery({
    queryKey: ["builds", containerId, buildType],
    queryFn: () => fetchBuilds(containerId!, buildType),
    enabled: isReady && !!containerId,
  });
}
```

## 🎨 UI/UX - Shadcn/UI + Tailwind

### Configuration Shadcn/UI (`components.json`)
- **Style** : "new-york"
- **Base Color** : "neutral" 
- **CSS Variables** : Activées
- **Icon Library** : Lucide React

### Tailwind CSS v4
- **Configuration** : Inline dans `globals.css`
- **Design Tokens** : Utilisation des CSS custom properties
- **Dark Mode** : Supporté via next-themes
- **Extensions** : tw-animate-css pour les animations

### Architecture des Composants
```
components/
├── ui/           # Shadcn/UI base components
│   ├── button.tsx
│   ├── card.tsx  
│   ├── form.tsx
│   └── ...
└── [autres]/     # Composants métier dans app/components/
```

## 🔒 Validation & Types

### Zod Validators (`validators/`)
- **Centralisation** : Tous les schémas dans `validators/index.ts`
- **Typage automatique** : `z.infer<typeof schema>`
- **Validation côté client et serveur**

### Types TypeScript (`types/`)
- **Centralisation** : Export via `types/index.ts`
- **Séparation par domaine** : auth, organization, admin, etc.
- **Typage NextAuth** : Extensions dans `next-auth.d.ts`

## 🛠️ Scripts et Utilitaires

### Scripts npm
```bash
npm run dev          # Dev avec Turbopack
npm run build        # Build production
npm run lint         # ESLint
npm run db:push      # Prisma sync
npm run azure:sync   # Sync containers Azure
```

### Scripts Azure (`scripts/`)
- `sync-azure-containers.ts` : Synchronisation des containers
- `list-containers.ts` : Liste des containers Azure
- `recreate-missing-containers.ts` : Recréation containers manquants

## 🚨 Points Critiques de Sécurité

### ✅ À Respecter Absolument

1. **Auth Wrapper Obligatoire**
   - Toujours utiliser `withOrgAuth()` pour les routes sensibles
   - Vérifier que `request.organization` contient les bonnes données

2. **Isolation des Données**
   - Jamais d'accès cross-organisation sans vérification
   - Utiliser `containerId` pour filtrer les données Azure

3. **Validation des Permissions**
   - Vérifier les rôles avant les actions sensibles
   - OWNER > ADMIN > MEMBER dans la hiérarchie

4. **Routes API Protégées**
   - Sauf `/api/unity/*` (public pour WebGL)
   - Toutes les autres routes doivent être protégées

### ⚠️ Points d'Attention

1. **Context Switching**
   - Toujours vérifier l'organisation active avant les requêtes
   - Utiliser `useCurrentContainerId()` pour obtenir le container actuel

2. **Invitations**
   - Système de codes + tokens pour la sécurité
   - Expiration automatique des invitations

3. **Azure Storage**
   - Génération de SAS URLs temporaires
   - Isolation par container d'organisation

## 📝 Standards de Développement

### Conventions de Nommage
- **Fichiers** : kebab-case (`organization-switcher.tsx`)
- **Composants** : PascalCase (`OrganizationSwitcher`)  
- **Hooks** : camelCase avec préfixe `use` (`useOrganizations`)
- **Types** : PascalCase (`Organization`, `Role`)

### Architecture des Composants
- **Un composant = un fichier**
- **Colocalization** : hooks et composants dans le même dossier de feature
- **Réutilisabilité** : composants UI dans `components/ui/`

### Gestion des Erreurs
- **Validation Zod** côté client et serveur
- **Try-catch** dans les hooks avec gestion d'état d'erreur
- **Toast notifications** avec Sonner

### Performance
- **React Query** pour la mise en cache
- **Lazy loading** des composants lourds
- **Prefetch** sur hover pour les liens critiques

## 🔄 Workflow de Développement

### Nouvelle Feature
1. Créer les types dans `types/`
2. Créer les validators Zod dans `validators/`  
3. Créer le hook React Query dans le dossier feature
4. Créer les composants UI
5. Ajouter la route API avec auth wrapper
6. Tester l'isolation multitenant

### Sécurité Checklist
- [ ] Route API utilise `withOrgAuth()`
- [ ] Vérification des permissions selon le rôle  
- [ ] Isolation des données par organisation
- [ ] Validation Zod des inputs
- [ ] Tests d'accès cross-organisation

---

**Important** : Cette architecture garantit la sécurité multitenant et la cohérence du code. Tout écart à ces standards doit être justifié et documenté.