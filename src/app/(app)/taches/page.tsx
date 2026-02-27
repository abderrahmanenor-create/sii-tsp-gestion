"use client"

import { useAuth } from "@/hooks/use-session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Wrench,
  Zap,
  ClipboardList,
  MoreVertical,
  Filter,
  GripVertical,
  Calendar,
  User,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Edit
} from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { StatutTache, Priorite, TypeTache, statutTacheLabels, prioriteLabels, typeTacheLabels } from "@/lib/types"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Tache {
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
  createdAt: string
  zone?: { id: string; nom: string; code: string } | null
  assignee?: { id: string; nom: string; prenom: string; photo?: string | null } | null
  equipe?: { id: string; nom: string } | null
}

interface Zone {
  id: string
  code: string
  nom: string
}

interface User {
  id: string
  nom: string
  prenom: string
  photo?: string | null
}

interface Equipe {
  id: string
  nom: string
}

const columns = [
  { id: StatutTache.A_FAIRE, label: "À faire", color: "bg-gray-100" },
  { id: StatutTache.EN_COURS, label: "En cours", color: "bg-blue-100" },
  { id: StatutTache.EN_ATTENTE, label: "En attente", color: "bg-yellow-100" },
  { id: StatutTache.TERMINE, label: "Terminé", color: "bg-green-100" },
]

export default function TachesPage() {
  const { user } = useAuth()
  const [taches, setTaches] = useState<Tache[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTache, setEditingTache] = useState<Tache | null>(null)
  const [draggedTache, setDraggedTache] = useState<Tache | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<StatutTache | null>(null)

  // Filters
  const [filterType, setFilterType] = useState<string>("all")
  const [filterZone, setFilterZone] = useState<string>("all")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")

  // Form state
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    type: TypeTache.MECANIQUE,
    priorite: Priorite.NORMALE,
    statut: StatutTache.A_FAIRE,
    zoneId: "",
    assigneeId: "",
    equipeId: "",
    dateEcheance: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tachesRes, zonesRes, usersRes, equipesRes] = await Promise.all([
        fetch("/api/taches"),
        fetch("/api/zones"),
        fetch("/api/users"),
        fetch("/api/equipes")
      ])

      if (tachesRes.ok) setTaches(await tachesRes.json())
      if (zonesRes.ok) setZones(await zonesRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
      if (equipesRes.ok) setEquipes(await equipesRes.json())
    } catch (error) {
      console.error("Erreur chargement données:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTaches = taches.filter(tache => {
    if (filterType !== "all" && tache.type !== filterType) return false
    if (filterZone !== "all" && tache.zoneId !== filterZone) return false
    if (filterAssignee !== "all" && tache.assigneeId !== filterAssignee) return false
    return true
  })

  const getTachesByStatut = (statut: StatutTache) => 
    filteredTaches.filter(tache => tache.statut === statut)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingTache ? `/api/taches/${editingTache.id}` : "/api/taches"
      const method = editingTache ? "PUT" : "POST"
      
      const body = {
        ...formData,
        zoneId: formData.zoneId || null,
        assigneeId: formData.assigneeId || null,
        equipeId: formData.equipeId || null,
        dateEcheance: formData.dateEcheance ? new Date(formData.dateEcheance).toISOString() : null
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(editingTache ? "Tâche modifiée" : "Tâche créée")
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        toast.error("Erreur lors de l'enregistrement")
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette tâche ?")) return

    try {
      const res = await fetch(`/api/taches/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Tâche supprimée")
        fetchData()
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleDragStart = (e: React.DragEvent, tache: Tache) => {
    setDraggedTache(tache)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, statut: StatutTache) => {
    e.preventDefault()
    setDragOverColumn(statut)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, newStatut: StatutTache) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (!draggedTache || draggedTache.statut === newStatut) {
      setDraggedTache(null)
      return
    }

    try {
      const res = await fetch(`/api/taches/${draggedTache.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut })
      })

      if (res.ok) {
        setTaches(prev => prev.map(t => 
          t.id === draggedTache.id ? { ...t, statut: newStatut } : t
        ))
        toast.success("Statut mis à jour")
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setDraggedTache(null)
    }
  }

  const resetForm = () => {
    setFormData({
      titre: "",
      description: "",
      type: TypeTache.MECANIQUE,
      priorite: Priorite.NORMALE,
      statut: StatutTache.A_FAIRE,
      zoneId: "",
      assigneeId: "",
      equipeId: "",
      dateEcheance: ""
    })
    setEditingTache(null)
  }

  const openEditDialog = (tache: Tache) => {
    setEditingTache(tache)
    setFormData({
      titre: tache.titre,
      description: tache.description || "",
      type: tache.type,
      priorite: tache.priorite,
      statut: tache.statut,
      zoneId: tache.zoneId || "",
      assigneeId: tache.assigneeId || "",
      equipeId: tache.equipeId || "",
      dateEcheance: tache.dateEcheance ? tache.dateEcheance.split("T")[0] : ""
    })
    setDialogOpen(true)
  }

  const getPriorityColor = (priorite: Priorite) => {
    switch (priorite) {
      case Priorite.URGENTE: return "bg-red-500 text-white"
      case Priorite.HAUTE: return "bg-orange-500 text-white"
      case Priorite.NORMALE: return "bg-blue-500 text-white"
      case Priorite.BASSE: return "bg-gray-500 text-white"
    }
  }

  const getTypeIcon = (type: TypeTache) => {
    switch (type) {
      case TypeTache.MECANIQUE: return <Wrench className="w-4 h-4 text-blue-600" />
      case TypeTache.ELECTRICITE: return <Zap className="w-4 h-4 text-yellow-600" />
      default: return <ClipboardList className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#002E5D]" />
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#002E5D]">Gestion des Tâches</h1>
          <p className="text-gray-600">Glissez-déposez pour changer le statut</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button className="bg-[#002E5D] hover:bg-[#001a36]">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Tâche
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingTache ? "Modifier la tâche" : "Nouvelle tâche"}</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations de la tâche
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="titre">Titre *</Label>
                    <Input
                      id="titre"
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as TypeTache })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(typeTacheLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Priorité</Label>
                      <Select value={formData.priorite} onValueChange={(v) => setFormData({ ...formData, priorite: v as Priorite })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(prioriteLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Zone</Label>
                      <Select value={formData.zoneId} onValueChange={(v) => setFormData({ ...formData, zoneId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>{zone.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Échéance</Label>
                      <Input
                        type="date"
                        value={formData.dateEcheance}
                        onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Assigner à</Label>
                      <Select value={formData.assigneeId} onValueChange={(v) => setFormData({ ...formData, assigneeId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.prenom} {u.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Équipe</Label>
                      <Select value={formData.equipeId} onValueChange={(v) => setFormData({ ...formData, equipeId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipes.map((eq) => (
                            <SelectItem key={eq.id} value={eq.id}>{eq.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#002E5D] hover:bg-[#001a36]">
                    {editingTache ? "Modifier" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-500" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            {Object.entries(typeTacheLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterZone} onValueChange={setFilterZone}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes zones</SelectItem>
            {zones.map((zone) => (
              <SelectItem key={zone.id} value={zone.id}>{zone.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Assigné à" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.prenom} {u.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`w-80 flex flex-col rounded-lg ${
                dragOverColumn === column.id ? "ring-2 ring-[#002E5D]" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={`${column.color} p-3 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column.label}</h3>
                  <Badge variant="secondary">{getTachesByStatut(column.id).length}</Badge>
                </div>
              </div>
              <ScrollArea className="flex-1 p-2 bg-gray-50 rounded-b-lg">
                <div className="space-y-2">
                  {getTachesByStatut(column.id).map((tache) => (
                    <Card
                      key={tache.id}
                      className={`cursor-move hover:shadow-md transition-shadow ${
                        draggedTache?.id === tache.id ? "opacity-50" : ""
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tache)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(tache.type)}
                            <span className="font-medium text-sm">{tache.titre}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openEditDialog(tache)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(tache.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {tache.description && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{tache.description}</p>
                        )}
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getPriorityColor(tache.priorite)}>
                            {prioriteLabels[tache.priorite]}
                          </Badge>
                          {tache.zone && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {tache.zone.code}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                          {tache.assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={tache.assignee.photo || ""} />
                                <AvatarFallback className="text-xs">
                                  {tache.assignee.prenom[0]}{tache.assignee.nom[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-600">
                                {tache.assignee.prenom} {tache.assignee.nom}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Non assignée</span>
                          )}
                          {tache.dateEcheance && (
                            <span className="text-xs text-gray-500">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {format(new Date(tache.dateEcheance), "dd/MM", { locale: fr })}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {getTachesByStatut(column.id).length === 0 && (
                    <div className="text-center text-gray-400 py-8 text-sm">
                      Aucune tâche
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
