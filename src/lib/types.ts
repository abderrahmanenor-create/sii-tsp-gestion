// Types for the SII TSP Gestion Application

export enum Role {
  ADMIN = "ADMIN",
  CHEF_PROJET = "CHEF_PROJET",
  RH = "RH",
  SUPERVISEUR = "SUPERVISEUR",
  AGENT = "AGENT"
}

export enum StatutZone {
  EN_COURS = "EN_COURS",
  SUSPENDU = "SUSPENDU",
  EN_ATTENTE = "EN_ATTENTE",
  LIVRE = "LIVRE",
  FERME = "FERME",
  LITIGE = "LITIGE"
}

export enum StatutTache {
  A_FAIRE = "A_FAIRE",
  EN_COURS = "EN_COURS",
  EN_ATTENTE = "EN_ATTENTE",
  TERMINE = "TERMINE",
  ANNULE = "ANNULE"
}

export enum Priorite {
  BASSE = "BASSE",
  NORMALE = "NORMALE",
  HAUTE = "HAUTE",
  URGENTE = "URGENTE"
}

export enum TypeTache {
  MECANIQUE = "MECANIQUE",
  ELECTRICITE = "ELECTRICITE",
  GENERAL = "GENERAL"
}

export enum TypeMouvement {
  ENTREE = "ENTREE",
  SORTIE = "SORTIE",
  TRANSFERT_ENTREE = "TRANSFERT_ENTREE",
  TRANSFERT_SORTIE = "TRANSFERT_SORTIE",
  INVENTAIRE = "INVENTAIRE"
}

export enum CodePointage {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  CONGE = "CONGE",
  MALADIE = "MALADIE",
  FORMATION = "FORMATION",
  RETARD = "RETARD",
  DEPART_ANTICIPE = "DEPART_ANTICIPE"
}

// Label translations
export const roleLabels: Record<Role, string> = {
  [Role.ADMIN]: "Administrateur",
  [Role.CHEF_PROJET]: "Chef de Projet",
  [Role.RH]: "Ressources Humaines",
  [Role.SUPERVISEUR]: "Superviseur",
  [Role.AGENT]: "Agent"
}

export const statutZoneLabels: Record<StatutZone, string> = {
  [StatutZone.EN_COURS]: "En cours",
  [StatutZone.SUSPENDU]: "Suspendu",
  [StatutZone.EN_ATTENTE]: "En attente",
  [StatutZone.LIVRE]: "Livré",
  [StatutZone.FERME]: "Fermé",
  [StatutZone.LITIGE]: "Litige"
}

export const statutTacheLabels: Record<StatutTache, string> = {
  [StatutTache.A_FAIRE]: "À faire",
  [StatutTache.EN_COURS]: "En cours",
  [StatutTache.EN_ATTENTE]: "En attente",
  [StatutTache.TERMINE]: "Terminé",
  [StatutTache.ANNULE]: "Annulé"
}

export const prioriteLabels: Record<Priorite, string> = {
  [Priorite.BASSE]: "Basse",
  [Priorite.NORMALE]: "Normale",
  [Priorite.HAUTE]: "Haute",
  [Priorite.URGENTE]: "Urgente"
}

export const typeTacheLabels: Record<TypeTache, string> = {
  [TypeTache.MECANIQUE]: "Mécanique",
  [TypeTache.ELECTRICITE]: "Électricité",
  [TypeTache.GENERAL]: "Général"
}

export const typeMouvementLabels: Record<TypeMouvement, string> = {
  [TypeMouvement.ENTREE]: "Entrée",
  [TypeMouvement.SORTIE]: "Sortie",
  [TypeMouvement.TRANSFERT_ENTREE]: "Transfert (Entrée)",
  [TypeMouvement.TRANSFERT_SORTIE]: "Transfert (Sortie)",
  [TypeMouvement.INVENTAIRE]: "Inventaire"
}

export const codePointageLabels: Record<CodePointage, string> = {
  [CodePointage.PRESENT]: "Présent",
  [CodePointage.ABSENT]: "Absent",
  [CodePointage.CONGE]: "Congé",
  [CodePointage.MALADIE]: "Maladie",
  [CodePointage.FORMATION]: "Formation",
  [CodePointage.RETARD]: "Retard",
  [CodePointage.DEPART_ANTICIPE]: "Départ anticipé"
}

// User type
export interface User {
  id: string
  email: string
  nom: string
  prenom: string
  telephone?: string | null
  photo?: string | null
  role: Role
  actif: boolean
  equipeId?: string | null
  zoneId?: string | null
  equipe?: { id: string; nom: string } | null
  zone?: { id: string; nom: string } | null
  createdAt: string
}

// Zone type
export interface Zone {
  id: string
  code: string
  nom: string
  description?: string | null
  statut: StatutZone
  dateDebut?: string | null
  dateFin?: string | null
  createdAt: string
  _count?: { users: number; equipes: number; taches: number }
}

// Equipe type
export interface Equipe {
  id: string
  nom: string
  description?: string | null
  zoneId: string
  chefEquipeId?: string | null
  zone?: { id: string; nom: string; code: string }
  chefEquipe?: { id: string; nom: string; prenom: string } | null
  _count?: { membres: number }
  membres?: User[]
}

// Tache type
export interface Tache {
  id: string
  titre: string
  description?: string | null
  statut: StatutTache
  priorite: Priorite
  type: TypeTache
  dateEcheance?: string | null
  zoneId?: string | null
  createurId: string
  assigneeId?: string | null
  equipeId?: string | null
  noteVocaleId?: string | null
  createdAt: string
  zone?: { id: string; nom: string; code: string } | null
  createur?: { id: string; nom: string; prenom: string }
  assignee?: { id: string; nom: string; prenom: string; photo?: string | null } | null
  equipe?: { id: string; nom: string } | null
  noteVocale?: { id: string; transcription?: string | null } | null
}

// NoteVocale type
export interface NoteVocale {
  id: string
  audioUrl: string
  transcription?: string | null
  duree: number
  userId: string
  tacheId?: string | null
  createdAt: string
  user?: { id: string; nom: string; prenom: string; photo?: string | null }
  tache?: { id: string; titre: string; statut: StatutTache } | null
}

// Stock types
export interface CategorieArticle {
  id: string
  nom: string
  description?: string | null
  _count?: { articles: number }
}

export interface Article {
  id: string
  code: string
  nom: string
  description?: string | null
  unite: string
  seuilAlerte: number
  categorieId: string
  categorie?: CategorieArticle
  stocksZone?: ArticleZone[]
  stockTotal?: number
  _count?: { mouvements: number }
}

export interface ArticleZone {
  id: string
  articleId: string
  zoneId: string
  quantite: number
  emplacement?: string | null
  zone?: { id: string; nom: string; code: string }
  article?: Article
}

export interface MouvementStock {
  id: string
  articleId: string
  zoneId: string
  type: TypeMouvement
  quantite: number
  motif?: string | null
  referenceDoc?: string | null
  userId: string
  createdAt: string
  article?: { id: string; code: string; nom: string; unite: string }
  zone?: { id: string; nom: string; code: string }
  user?: { id: string; nom: string; prenom: string }
}

// Pointage type
export interface Pointage {
  id: string
  userId: string
  zoneId: string
  date: string
  heureArrivee?: string | null
  heureDepart?: string | null
  codePointage: CodePointage
  heuresTravaillees?: number | null
  heuresSup?: number | null
  motif?: string | null
  valide: boolean
  valideParId?: string | null
  createdAt: string
  user?: { id: string; nom: string; prenom: string; photo?: string | null; role: Role }
  zone?: { id: string; nom: string; code: string }
}

// Dashboard stats type
export interface DashboardStats {
  tachesEnCours: number
  tachesTerminees: number
  alertesStock: number
  pointagesJour: number
  tachesParType: { type: TypeTache; count: number }[]
  pointagesParZone: { zone: string; count: number }[]
  recentTaches: Tache[]
}
