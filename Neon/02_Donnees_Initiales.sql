-- ==========================================
-- SCRIPT SQL POUR NEON - Donnees initiales
-- A executer APRES le script de creation des tables
-- ==========================================

-- Inserer des Zones
INSERT INTO "Zone" ("id", "code", "nom", "description", "statut") VALUES
('zone1', 'Z-001', 'Zone A - Atelier Principal', 'Atelier de maintenance mecanique', 'EN_COURS'),
('zone2', 'Z-002', 'Zone B - Electricite', 'Zone interventions electriques', 'EN_COURS'),
('zone3', 'Z-003', 'Zone C - Stockage', 'Zone de stockage materiel', 'EN_COURS'),
('zone4', 'Z-004', 'Zone D - Administration', 'Bureaux et administration', 'LIVRE');

-- Inserer les Utilisateurs
-- Mot de passe pour tous : password
INSERT INTO "User" ("id", "email", "password", "nom", "prenom", "role", "zoneId", "actif") VALUES
('user1', 'admin@sii.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'System', 'ADMIN', 'zone4', true),
('user2', 'chef@sii.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dupont', 'Jean', 'CHEF_PROJET', 'zone1', true),
('user3', 'agent1@sii.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Martin', 'Pierre', 'AGENT', 'zone1', true),
('user4', 'agent2@sii.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bernard', 'Marie', 'AGENT', 'zone2', true),
('user5', 'agent3@sii.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Petit', 'Luc', 'AGENT', 'zone3', true);

-- Inserer des Equipes
INSERT INTO "Equipe" ("id", "nom", "description", "zoneId", "chefEquipeId") VALUES
('eq1', 'Equipe Mecanique A', 'Equipe de maintenance mecanique', 'zone1', 'user2'),
('eq2', 'Equipe Electricite', 'Equipe interventions electriques', 'zone2', NULL),
('eq3', 'Equipe Logistique', 'Equipe gestion stock', 'zone3', NULL);

-- Mettre a jour les utilisateurs avec leur equipe
UPDATE "User" SET "equipeId" = 'eq1' WHERE "id" = 'user3';
UPDATE "User" SET "equipeId" = 'eq2' WHERE "id" = 'user4';
UPDATE "User" SET "equipeId" = 'eq3' WHERE "id" = 'user5';

-- Inserer des Categories d'Articles
INSERT INTO "CategorieArticle" ("id", "nom", "description") VALUES
('cat1', 'Outillage', 'Outils manuels et electriques'),
('cat2', 'Consommables', 'Pieces detachees et consommables'),
('cat3', 'Equipements', 'Equipements de protection et materiels'),
('cat4', 'Electricite', 'Materiel electrique');

-- Inserer des Articles
INSERT INTO "Article" ("id", "code", "nom", "description", "unite", "seuilAlerte", "categorieId") VALUES
('art1', 'OUT-001', 'Cle a molette', 'Cle a molette 200mm', 'pcs', 5, 'cat1'),
('art2', 'OUT-002', 'Tournevis plat', 'Jeu de tournevis plats', 'pcs', 10, 'cat1'),
('art3', 'CON-001', 'Visserie divers', 'Lot de vis et ecrous', 'kg', 20, 'cat2'),
('art4', 'CON-002', 'Joint torique', 'Joints toriques assortis', 'pcs', 50, 'cat2'),
('art5', 'ELE-001', 'Cable electrique', 'Cable cuivre 2.5mm', 'm', 100, 'cat4'),
('art6', 'ELE-002', 'Disjoncteur', 'Disjoncteur 20A', 'pcs', 5, 'cat4'),
('art7', 'EQP-001', 'Casque protection', 'Casque de chantier', 'pcs', 10, 'cat3'),
('art8', 'EQP-002', 'Gants de travail', 'Gants de protection', 'paires', 20, 'cat3');

-- Inserer du stock par zone
INSERT INTO "ArticleZone" ("articleId", "zoneId", "quantite", "emplacement") VALUES
('art1', 'zone1', 15, 'Rayon A1'),
('art2', 'zone1', 25, 'Rayon A1'),
('art3', 'zone3', 50, 'Etagere B2'),
('art4', 'zone3', 100, 'Etagere B2'),
('art5', 'zone2', 200, 'Stockage C1'),
('art6', 'zone2', 10, 'Stockage C1'),
('art7', 'zone4', 30, 'Armoire D1'),
('art8', 'zone4', 50, 'Armoire D1');

-- Inserer quelques taches exemple
INSERT INTO "Tache" ("id", "titre", "description", "statut", "priorite", "type", "createurId", "assigneeId", "zoneId", "equipeId") VALUES
('tache1', 'Maintenance pompe hydraulique', 'Remplacement des joints de la pompe principale', 'EN_COURS', 'HAUTE', 'MECANIQUE', 'user2', 'user3', 'zone1', 'eq1'),
('tache2', 'Installation tableau electrique', 'Mise en place du nouveau tableau electrique Zone B', 'A_FAIRE', 'NORMALE', 'ELECTRICITE', 'user2', 'user4', 'zone2', 'eq2'),
('tache3', 'Inventaire stock', 'Realiser inventaire mensuel du stock', 'A_FAIRE', 'BASSE', 'GENERAL', 'user2', 'user5', 'zone3', 'eq3');

-- Message de confirmation
SELECT 'Donnees initiales inserees avec succes !' as message;