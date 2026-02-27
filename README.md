# 🏗️ SII TSP Gestion - Application de Gestion de Chantier Industriel

Application SaaS complète pour la gestion de chantiers industriels (mécanique/électricité) avec support hors ligne (PWA), développée pour SII - Partenaire JESA OCP.

## ✨ Fonctionnalités Principales

### 🔐 Authentification & Gestion des Utilisateurs
- 5 rôles : ADMIN, CHEF_PROJET, RH, SUPERVISEUR, AGENT
- Gestion complète des profils utilisateurs
- Attribution équipes/zones

### 📊 Tableau de Bord
- KPIs en temps réel (tâches, stock, pointage)
- Alertes automatiques (stock bas, retards)
- Graphiques interactifs

### ✅ Gestion des Tâches (Kanban)
- Tableau Kanban avec drag & drop
- Statuts : À faire, En cours, En attente, Terminé, Annulé
- Priorités et types (Mécanique, Électricité, Général)
- Assignation aux équipes/zones

### 🎤 Notes Vocales avec ASR
- Enregistrement audio intégré
- Transcription automatique (Speech-to-Text)
- Conversion en tâches Kanban

### 📦 Gestion de Stock
- Articles avec catégories
- Mouvements (entrée, sortie, transfert)
- Alertes de stock bas
- Stock par zone

### ⏰ Système de Pointage
- Pointage quotidien
- Codes : Présent, Absent, Congé, Maladie, Formation, Retard
- Validation par superviseur
- Calcul heures travaillées/supplémentaires

### 👥 Gestion des Équipes & Zones
- Création d'équipes
- Assignation aux zones de chantier
- Chef d'équipe

### 📱 PWA (Progressive Web App)
- Installation sur mobile/desktop
- Fonctionnement hors ligne
- Synchronisation automatique

## 🛠️ Stack Technique

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **UI**: shadcn/ui, Lucide Icons, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de données**: SQLite (dev) / PostgreSQL (prod)
- **Auth**: NextAuth.js
- **IA**: z-ai-web-dev-sdk (ASR pour transcription vocale)

## 🚀 Déploiement sur Vercel (Gratuit)

### Étape 1 : Préparer la base de données PostgreSQL

**Option A - Neon (Recommandé, gratuit) :**
1. Allez sur [neon.tech](https://neon.tech)
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Copiez l'URL de connexion PostgreSQL

**Option B - Supabase (Gratuit) :**
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un projet
3. Dans Settings > Database, copiez l'URI de connexion

### Étape 2 : Déployer sur Vercel

1. **Créer un compte Vercel** : [vercel.com](https://vercel.com)

2. **Importer le projet** :
   - Cliquez "Add New..." > "Project"
   - Importez depuis GitHub/GitLab/Bitbucket ou uploadez le dossier

3. **Configurer les variables d'environnement** :
   
   Dans "Environment Variables", ajoutez :
   
   ```
   DATABASE_URL=postgresql://...votre_url_neon_ou_supabase...
   NEXTAUTH_SECRET=générer_avec_openssl_rand_base64_32
   NEXTAUTH_URL=https://votre-app.vercel.app
   ```
   
   Pour générer NEXTAUTH_SECRET :
   ```bash
   openssl rand -base64 32
   ```

4. **Modifier le schema Prisma pour PostgreSQL** :
   
   Avant de déployer, renommez le fichier :
   ```bash
   mv prisma/schema.postgresql.prisma prisma/schema.prisma
   ```

5. **Déployer** :
   - Cliquez "Deploy"
   - Attendez la fin du déploiement

### Étape 3 : Initialiser la base de données

Après le déploiement, dans le dashboard Vercel :
1. Allez dans "Storage" ou utilisez le terminal
2. Exécutez les migrations Prisma :
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

Ou utilisez Vercel CLI :
```bash
vercel env pull .env
npx prisma migrate deploy
npx prisma db seed
```

## 🏃 Démarrage Local

```bash
# Installer les dépendances
bun install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Créer la base de données
bunx prisma migrate dev

# Peupler avec des données de test
bunx prisma db seed

# Démarrer le serveur de développement
bun run dev
```

## 👤 Comptes de Test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@sii.fr | admin123 | Administrateur |
| chef@sii.fr | chef123 | Chef de Projet |
| agent1@sii.fr | agent123 | Agent |

## 📁 Structure du Projet

```
src/
├── app/
│   ├── (app)/           # Pages protégées
│   │   ├── dashboard/   # Tableau de bord
│   │   ├── taches/      # Kanban
│   │   ├── notes/       # Notes vocales
│   │   ├── stock/       # Gestion stock
│   │   ├── pointage/    # Pointage
│   │   ├── equipes/     # Équipes
│   │   ├── zones/       # Zones
│   │   └── utilisateurs/# Utilisateurs (Admin)
│   ├── api/             # API Routes
│   └── page.tsx         # Page de login
├── components/
│   └── ui/              # Composants shadcn/ui
├── lib/                 # Utilitaires
└── types/               # Types TypeScript

prisma/
├── schema.prisma        # Schema SQLite (dev)
├── schema.postgresql.prisma # Schema PostgreSQL (prod)
└── seed.ts              # Données initiales

public/
├── manifest.json        # PWA Manifest
├── sw.js               # Service Worker
└── logo_SII.png        # Logo
```

## 🔧 Variables d'Environnement

```env
# Base de données
DATABASE_URL="file:./dev.db"  # SQLite pour dev
# DATABASE_URL="postgresql://..." # PostgreSQL pour prod

# NextAuth
NEXTAUTH_SECRET="votre_secret_base64"
NEXTAUTH_URL="http://localhost:3000"  # ou URL prod

# Optionnel : pour ASR avancé
# ZAI_API_KEY="..."
```

## 📱 Installation PWA

1. Ouvrez l'application dans Chrome/Edge/Safari
2. Dans le menu du navigateur, sélectionnez "Installer l'application"
3. L'application sera disponible sur votre bureau/écran d'accueil

## 🤝 Support

Pour toute question ou problème :
- Email : support@sii.fr
- Documentation : [docs.sii-tsp-gestion.fr](#)

---

Développé par **SII - Société d'Ingénierie et d'Innovation**  
Partenaire **JESA OCP**

🚀 Prêt pour déploiement sur Vercel, Netlify, ou serveur dédié.
