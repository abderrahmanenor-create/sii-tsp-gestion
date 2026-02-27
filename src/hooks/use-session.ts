"use client"

import { useSession } from "next-auth/react"
import { Role } from "@/lib/types"

export function useAuth() {
  const { data: session, status } = useSession()

  const user = session?.user

  const isAdmin = user?.role === Role.ADMIN
  const isChefProjet = user?.role === Role.CHEF_PROJET
  const isRH = user?.role === Role.RH
  const isSuperviseur = user?.role === Role.SUPERVISEUR
  const isAgent = user?.role === Role.AGENT

  const canManageUsers = isAdmin
  const canManageZones = isAdmin || isChefProjet
  const canManageEquipes = isAdmin || isChefProjet
  const canValidatePointage = isAdmin || isChefProjet || isRH || isSuperviseur

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin,
    isChefProjet,
    isRH,
    isSuperviseur,
    isAgent,
    canManageUsers,
    canManageZones,
    canManageEquipes,
    canValidatePointage
  }
}
