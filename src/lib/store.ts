"use client"

import { create } from "zustand"
import { User, Zone, Equipe, Tache, NoteVocale, Article, Pointage } from "./types"

interface AppState {
  // User
  currentUser: User | null
  setCurrentUser: (user: User | null) => void

  // Zones
  zones: Zone[]
  setZones: (zones: Zone[]) => void
  
  // Equipes
  equipes: Equipe[]
  setEquipes: (equipes: Equipe[]) => void

  // Taches
  taches: Tache[]
  setTaches: (taches: Tache[]) => void
  addTache: (tache: Tache) => void
  updateTache: (id: string, data: Partial<Tache>) => void

  // Notes Vocales
  notesVocales: NoteVocale[]
  setNotesVocales: (notes: NoteVocale[]) => void
  addNoteVocale: (note: NoteVocale) => void

  // Stock
  articles: Article[]
  setArticles: (articles: Article[]) => void

  // Pointages
  pointages: Pointage[]
  setPointages: (pointages: Pointage[]) => void

  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // User
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // Zones
  zones: [],
  setZones: (zones) => set({ zones }),

  // Equipes
  equipes: [],
  setEquipes: (equipes) => set({ equipes }),

  // Taches
  taches: [],
  setTaches: (taches) => set({ taches }),
  addTache: (tache) => set((state) => ({ taches: [tache, ...state.taches] })),
  updateTache: (id, data) => set((state) => ({
    taches: state.taches.map((t) => t.id === id ? { ...t, ...data } : t)
  })),

  // Notes Vocales
  notesVocales: [],
  setNotesVocales: (notes) => set({ notesVocales: notes }),
  addNoteVocale: (note) => set((state) => ({ notesVocales: [note, ...state.notesVocales] })),

  // Stock
  articles: [],
  setArticles: (articles) => set({ articles }),

  // Pointages
  pointages: [],
  setPointages: (pointages) => set({ pointages }),

  // UI State
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading })
}))
