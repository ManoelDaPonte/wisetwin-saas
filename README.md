# WiseTwin SaaS

Application multitenant pour la gestion et la distribution de formations Unity WebGL (WiseTour et WiseTrainer).

## Installation

```bash
# Cloner le projet
git clone https://github.com/ManoelDaPonte/wisetwin-saas.git
cd wisetwin-saas

# Installer les dépendances
npm install

# Configuration de la base de données
npm run db:push

# Lancer en développement
npm run dev
```

## Configuration requise

- Node.js 18+
- PostgreSQL
- Variables d'environnement (voir `.env.example`)

## Scripts utiles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run lint` - Vérification du code
- `npm run db:push` - Synchronisation de la base de données

L'application sera disponible sur `http://localhost:3000`.