"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-session"
import { 
  LayoutDashboard, 
  ClipboardList, 
  Mic, 
  Package, 
  CalendarClock, 
  Users, 
  MapPin, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wrench,
  UserCog
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Role, roleLabels } from "@/lib/types"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { useState } from "react"

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, roles: [Role.ADMIN, Role.CHEF_PROJET, Role.RH, Role.SUPERVISEUR, Role.AGENT] },
  { name: "Tâches", href: "/taches", icon: ClipboardList, roles: [Role.ADMIN, Role.CHEF_PROJET, Role.RH, Role.SUPERVISEUR, Role.AGENT] },
  { name: "Notes Vocales", href: "/notes", icon: Mic, roles: [Role.ADMIN, Role.CHEF_PROJET, Role.RH, Role.SUPERVISEUR, Role.AGENT] },
  { name: "Stock", href: "/stock", icon: Package, roles: [Role.ADMIN, Role.CHEF_PROJET, Role.RH, Role.SUPERVISEUR, Role.AGENT] },
  { name: "Pointage", href: "/pointage", icon: CalendarClock, roles: [Role.ADMIN, Role.CHEF_PROJET, Role.RH, Role.SUPERVISEUR, Role.AGENT] },
  { name: "Équipes", href: "/equipes", icon: Users, roles: [Role.ADMIN, Role.CHEF_PROJET, Role.RH, Role.SUPERVISEUR] },
  { name: "Zones", href: "/zones", icon: MapPin, roles: [Role.ADMIN, Role.CHEF_PROJET, Role.RH, Role.SUPERVISEUR] },
  { name: "Utilisateurs", href: "/utilisateurs", icon: UserCog, roles: [Role.ADMIN] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, isAdmin, isChefProjet } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const filteredNavigation = navigation.filter((item) => {
    if (!user) return false
    return item.roles.includes(user.role as Role)
  })

  const initials = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : "?"

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-[#002E5D] text-white transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Image 
              src="/logo_SII.png.png" 
              alt="SII Logo" 
              width={40} 
              height={40}
              className="rounded"
            />
            <div>
              <h1 className="font-bold text-lg">SII TSP</h1>
              <p className="text-xs text-white/70">Gestion Chantier</p>
            </div>
          </div>
        )}
        {collapsed && (
          <Image 
            src="/logo_SII.png.png" 
            alt="SII Logo" 
            width={40} 
            height={40}
            className="rounded mx-auto"
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive 
                      ? "bg-white/20 text-white" 
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-4">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <Avatar className="w-10 h-10 border-2 border-white/30">
            <AvatarImage src={user?.photo || ""} alt={user?.nom} />
            <AvatarFallback className="bg-white/20 text-white text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-white/70 truncate">
                {user?.role ? roleLabels[user.role as Role] : ""}
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-20 -right-3 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-[#002E5D] hover:bg-gray-100"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  )
}
