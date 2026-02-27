-- ==========================================
-- SCRIPT SQL POUR NEON - SII TSP Gestion
-- A executer dans l'editeur SQL de Neon
-- ==========================================

-- Creer les types ENUM
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CHEF_PROJET', 'RH', 'SUPERVISEUR', 'AGENT');
CREATE TYPE "StatutZone" AS ENUM ('EN_COURS', 'SUSPENDU', 'EN_ATTENTE', 'LIVRE', 'FERME', 'LITIGE');
CREATE TYPE "StatutTache" AS ENUM ('A_FAIRE', 'EN_COURS', 'EN_ATTENTE', 'TERMINE', 'ANNULE');
CREATE TYPE "Priorite" AS ENUM ('BASSE', 'NORMALE', 'HAUTE', 'URGENTE');
CREATE TYPE "TypeTache" AS ENUM ('MECANIQUE', 'ELECTRICITE', 'GENERAL');
CREATE TYPE "TypeMouvement" AS ENUM ('ENTREE', 'SORTIE', 'TRANSFERT_ENTREE', 'TRANSFERT_SORTIE', 'INVENTAIRE');
CREATE TYPE "CodePointage" AS ENUM ('PRESENT', 'ABSENT', 'CONGE', 'MALADIE', 'FORMATION', 'RETARD', 'DEPART_ANTICIPE');

-- Creer la table Zone
CREATE TABLE "Zone" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" TEXT UNIQUE NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "statut" "StatutZone" DEFAULT 'EN_COURS',
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Creer la table User
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "photo" TEXT,
    "role" "Role" DEFAULT 'AGENT',
    "equipeId" TEXT,
    "zoneId" TEXT,
    "actif" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Creer la table Equipe
CREATE TABLE "Equipe" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "zoneId" TEXT NOT NULL,
    "chefEquipeId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Creer la table CategorieArticle
CREATE TABLE "CategorieArticle" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Creer la table Article
CREATE TABLE "Article" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" TEXT UNIQUE NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "unite" TEXT NOT NULL,
    "seuilAlerte" INTEGER DEFAULT 10,
    "categorieId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Creer la table ArticleZone
CREATE TABLE "ArticleZone" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "articleId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "quantite" INTEGER DEFAULT 0,
    "emplacement" TEXT
);

-- Creer la table NoteVocale
CREATE TABLE "NoteVocale" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "audioUrl" TEXT NOT NULL,
    "transcription" TEXT,
    "duree" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Creer la table Tache
CREATE TABLE "Tache" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "statut" "StatutTache" DEFAULT 'A_FAIRE',
    "priorite" "Priorite" DEFAULT 'NORMALE',
    "type" "TypeTache" DEFAULT 'MECANIQUE',
    "dateEcheance" TIMESTAMP(3),
    "zoneId" TEXT,
    "createurId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "equipeId" TEXT,
    "noteVocaleId" TEXT UNIQUE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Creer la table MouvementStock
CREATE TABLE "MouvementStock" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "articleId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "type" "TypeMouvement" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "motif" TEXT,
    "referenceDoc" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Creer la table Pointage
CREATE TABLE "Pointage" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heureArrivee" TIMESTAMP(3),
    "heureDepart" TIMESTAMP(3),
    "codePointage" "CodePointage" DEFAULT 'PRESENT',
    "heuresTravaillees" DECIMAL(65,30),
    "heuresSup" DECIMAL(65,30),
    "motif" TEXT,
    "valide" BOOLEAN DEFAULT false,
    "valideParId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Creer la table Notification
CREATE TABLE "Notification" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN DEFAULT false,
    "lien" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Ajouter les cles etrangeres
-- ==========================================

ALTER TABLE "User" ADD CONSTRAINT "User_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "Equipe"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "User" ADD CONSTRAINT "User_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "Equipe" ADD CONSTRAINT "Equipe_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "Equipe" ADD CONSTRAINT "Equipe_chefEquipeId_fkey" FOREIGN KEY ("chefEquipeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "Article" ADD CONSTRAINT "Article_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "CategorieArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ArticleZone" ADD CONSTRAINT "ArticleZone_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ArticleZone" ADD CONSTRAINT "ArticleZone_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "NoteVocale" ADD CONSTRAINT "NoteVocale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tache" ADD CONSTRAINT "Tache_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "Tache" ADD CONSTRAINT "Tache_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tache" ADD CONSTRAINT "Tache_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "Tache" ADD CONSTRAINT "Tache_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "Equipe"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "Tache" ADD CONSTRAINT "Tache_noteVocaleId_fkey" FOREIGN KEY ("noteVocaleId") REFERENCES "NoteVocale"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "MouvementStock" ADD CONSTRAINT "MouvementStock_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MouvementStock" ADD CONSTRAINT "MouvementStock_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "MouvementStock" ADD CONSTRAINT "MouvementStock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Pointage" ADD CONSTRAINT "Pointage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Pointage" ADD CONSTRAINT "Pointage_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "Pointage" ADD CONSTRAINT "Pointage_valideParId_fkey" FOREIGN KEY ("valideParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ==========================================
-- Ajouter les contraintes uniques
-- ==========================================

ALTER TABLE "ArticleZone" ADD CONSTRAINT "ArticleZone_articleId_zoneId_key" UNIQUE ("articleId", "zoneId");
ALTER TABLE "Pointage" ADD CONSTRAINT "Pointage_userId_date_key" UNIQUE ("userId", "date");

-- ==========================================
-- Creer les index
-- ==========================================

CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Zone_code_idx" ON "Zone"("code");
CREATE INDEX "Zone_statut_idx" ON "Zone"("statut");
CREATE INDEX "Equipe_zoneId_idx" ON "Equipe"("zoneId");
CREATE INDEX "Tache_statut_idx" ON "Tache"("statut");
CREATE INDEX "Tache_priorite_idx" ON "Tache"("priorite");
CREATE INDEX "Tache_type_idx" ON "Tache"("type");
CREATE INDEX "Tache_zoneId_idx" ON "Tache"("zoneId");
CREATE INDEX "Tache_assigneeId_idx" ON "Tache"("assigneeId");
CREATE INDEX "NoteVocale_userId_idx" ON "NoteVocale"("userId");
CREATE INDEX "NoteVocale_createdAt_idx" ON "NoteVocale"("createdAt");
CREATE INDEX "CategorieArticle_nom_idx" ON "CategorieArticle"("nom");
CREATE INDEX "Article_code_idx" ON "Article"("code");
CREATE INDEX "Article_categorieId_idx" ON "Article"("categorieId");
CREATE INDEX "ArticleZone_articleId_idx" ON "ArticleZone"("articleId");
CREATE INDEX "ArticleZone_zoneId_idx" ON "ArticleZone"("zoneId");
CREATE INDEX "MouvementStock_articleId_idx" ON "MouvementStock"("articleId");
CREATE INDEX "MouvementStock_zoneId_idx" ON "MouvementStock"("zoneId");
CREATE INDEX "MouvementStock_type_idx" ON "MouvementStock"("type");
CREATE INDEX "MouvementStock_createdAt_idx" ON "MouvementStock"("createdAt");
CREATE INDEX "Pointage_userId_idx" ON "Pointage"("userId");
CREATE INDEX "Pointage_zoneId_idx" ON "Pointage"("zoneId");
CREATE INDEX "Pointage_date_idx" ON "Pointage"("date");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_lu_idx" ON "Notification"("lu");

-- ==========================================
-- FIN DU SCRIPT DE CREATION DES TABLES
-- ==========================================

SELECT 'Tables creees avec succes !' as message;