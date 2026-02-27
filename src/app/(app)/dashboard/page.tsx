"use client"

import { useAuth } from "@/hooks/use-session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ClipboardList,
  Package,
  CalendarClock,
  TrendingUp,
  AlertTriangle,
  Plus,
  Mic,
  Wrench,
  Zap,
  Users,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface DashboardStats {
  tachesEnCours: number
  tachesTerminees: number
  alertesStock: number
  pointagesJour: number
  totalUsers: number
  tachesParType: { type: string; count: number }[]
  pointagesParZone: { zone: string; count: number }[]
  recentTaches: any[]
  alertesStockList: any[]
}

export default function DashboardPage() {
  const { user, isChefProjet, isAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Erreur chargement stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002E5D]"></div>
      </div>
    )
  }

  const totalTaches = (stats?.tachesEnCours || 0) + (stats?.tachesTerminees || 0)
  const completionRate = totalTaches > 0 ? Math.round((stats?.tachesTerminees || 0) / totalTaches * 100) : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#002E5D]">Tableau de Bord</h1>
          <p className="text-gray-600">
            Bienvenue, {user?.prenom} {user?.nom} • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/notes">
            <Button className="bg-[#002E5D] hover:bg-[#001a36]">
              <Mic className="w-4 h-4 mr-2" />
              Note Vocale
            </Button>
          </Link>
          <Link href="/taches">
            <Button variant="outline" className="border-[#002E5D] text-[#002E5D]">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Tâche
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-500" />
              Tâches en cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats?.tachesEnCours || 0}</div>
            <Progress value={100 - completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Tâches terminées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats?.tachesTerminees || 0}</div>
            <p className="text-sm text-gray-500 mt-1">{completionRate}% complété</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              Alertes Stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats?.alertesStock || 0}</div>
            <p className="text-sm text-gray-500 mt-1">Articles sous seuil</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-purple-500" />
              Pointages du jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats?.pointagesJour || 0}</div>
            <p className="text-sm text-gray-500 mt-1">Présences enregistrées</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tâches par Type */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Tâches par Type
            </CardTitle>
            <CardDescription>Répartition Mécanique / Électricité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {stats?.tachesParType?.map((item) => (
                <div
                  key={item.type}
                  className={`p-4 rounded-lg text-center ${
                    item.type === 'MECANIQUE'
                      ? 'bg-blue-50 border border-blue-200'
                      : item.type === 'ELECTRICITE'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {item.type === 'MECANIQUE' ? (
                      <Wrench className="w-5 h-5 text-blue-600" />
                    ) : item.type === 'ELECTRICITE' ? (
                      <Zap className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <ClipboardList className="w-5 h-5 text-gray-600" />
                    )}
                    <span className="font-medium">{item.type === 'MECANIQUE' ? 'Mécanique' : item.type === 'ELECTRICITE' ? 'Électricité' : 'Général'}</span>
                  </div>
                  <div className="text-2xl font-bold">{item.count}</div>
                </div>
              ))}
            </div>

            {/* Visual Progress */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-20 text-sm text-gray-600">Mécanique</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{
                      width: `${Math.max(10, (stats?.tachesParType?.find(t => t.type === 'MECANIQUE')?.count || 0) / Math.max(1, totalTaches) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 text-sm text-gray-600">Électricité</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full"
                    style={{
                      width: `${Math.max(10, (stats?.tachesParType?.find(t => t.type === 'ELECTRICITE')?.count || 0) / Math.max(1, totalTaches) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertes Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Alertes Stock
            </CardTitle>
            <CardDescription>Articles sous le seuil d'alerte</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.alertesStockList?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune alerte</p>
            ) : (
              <div className="space-y-2">
                {stats?.alertesStockList?.slice(0, 5).map((article: any) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-2 bg-orange-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{article.nom}</p>
                      <p className="text-xs text-gray-500">{article.code}</p>
                    </div>
                    <Badge variant="destructive">{article.stockTotal || 0} {article.unite}</Badge>
                  </div>
                ))}
              </div>
            )}
            <Link href="/stock">
              <Button variant="ghost" className="w-full mt-4 text-[#002E5D]">
                Voir tout le stock
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks & Pointages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tâches Récentes</CardTitle>
              <Link href="/taches">
                <Button variant="ghost" size="sm" className="text-[#002E5D]">
                  Voir tout <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentTaches?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune tâche récente</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentTaches?.map((tache: any) => (
                  <div
                    key={tache.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-2 rounded ${
                      tache.type === 'MECANIQUE' ? 'bg-blue-100' :
                      tache.type === 'ELECTRICITE' ? 'bg-yellow-100' : 'bg-gray-200'
                    }`}>
                      {tache.type === 'MECANIQUE' ? (
                        <Wrench className="w-4 h-4 text-blue-600" />
                      ) : tache.type === 'ELECTRICITE' ? (
                        <Zap className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <ClipboardList className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{tache.titre}</p>
                      <p className="text-xs text-gray-500">
                        {tache.zone?.nom || 'Sans zone'} • {tache.assignee?.nom || 'Non assignée'}
                      </p>
                    </div>
                    <Badge variant={
                      tache.statut === 'TERMINE' ? 'default' :
                      tache.statut === 'EN_COURS' ? 'secondary' :
                      tache.statut === 'EN_ATTENTE' ? 'outline' : 'destructive'
                    }>
                      {tache.statut === 'A_FAIRE' ? 'À faire' :
                       tache.statut === 'EN_COURS' ? 'En cours' :
                       tache.statut === 'EN_ATTENTE' ? 'En attente' :
                       tache.statut === 'TERMINE' ? 'Terminé' : 'Annulé'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pointages par Zone */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pointages par Zone
              </CardTitle>
              <Link href="/pointage">
                <Button variant="ghost" size="sm" className="text-[#002E5D]">
                  Gérer <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.pointagesParZone?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun pointage aujourd'hui</p>
            ) : (
              <div className="space-y-3">
                {stats?.pointagesParZone?.map((item: any) => (
                  <div
                    key={item.zone}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#002E5D]"></div>
                      <span className="font-medium">{item.zone}</span>
                    </div>
                    <Badge variant="secondary">{item.count} présents</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats for Admins/Chefs */}
      {(isAdmin || isChefProjet) && (
        <Card className="bg-gradient-to-r from-[#002E5D] to-[#001a36] text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Gestion Rapide</h3>
                <p className="text-white/70">Accédez rapidement aux fonctionnalités principales</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/utilisateurs">
                  <Button variant="secondary" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Utilisateurs
                  </Button>
                </Link>
                <Link href="/equipes">
                  <Button variant="secondary" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Équipes
                  </Button>
                </Link>
                <Link href="/zones">
                  <Button variant="secondary" size="sm">
                    <Wrench className="w-4 h-4 mr-2" />
                    Zones
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
