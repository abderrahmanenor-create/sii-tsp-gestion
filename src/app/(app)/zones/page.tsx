"use client"

import { useAuth } from "@/hooks/use-session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  MapPin,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Users,
  ClipboardList,
  Activity
} from "lucide-react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { StatutZone, statutZoneLabels } from "@/lib/types"

interface Zone {
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

const getStatutColor = (statut: StatutZone) => {
  switch (statut) {
    case StatutZone.EN_COURS: return "bg-green-500"
    case StatutZone.SUSPENDU: return "bg-yellow-500"
    case StatutZone.EN_ATTENTE: return "bg-blue-500"
    case StatutZone.LIVRE: return "bg-purple-500"
    case StatutZone.FERME: return "bg-gray-500"
    case StatutZone.LITIGE: return "bg-red-500"
  }
}

export default function ZonesPage() {
  const { user, canManageZones } = useAuth()
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)

  const [formData, setFormData] = useState({
    code: "",
    nom: "",
    description: "",
    statut: StatutZone.EN_COURS,
    dateDebut: "",
    dateFin: ""
  })

  useEffect(() => {
    fetchZones()
  }, [])

  const fetchZones = async () => {
    try {
      const res = await fetch("/api/zones")
      if (res.ok) setZones(await res.json())
    } catch (error) {
      console.error("Erreur chargement zones:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingZone ? `/api/zones/${editingZone.id}` : "/api/zones"
      const method = editingZone ? "PUT" : "POST"
      
      const body = {
        ...formData,
        dateDebut: formData.dateDebut ? new Date(formData.dateDebut).toISOString() : null,
        dateFin: formData.dateFin ? new Date(formData.dateFin).toISOString() : null
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(editingZone ? "Zone modifiée" : "Zone créée")
        setDialogOpen(false)
        resetForm()
        fetchZones()
      } else {
        toast.error("Erreur lors de l'enregistrement")
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette zone ?")) return

    try {
      const res = await fetch(`/api/zones/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Zone supprimée")
        fetchZones()
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      nom: "",
      description: "",
      statut: StatutZone.EN_COURS,
      dateDebut: "",
      dateFin: ""
    })
    setEditingZone(null)
  }

  const openEditDialog = (zone: Zone) => {
    setEditingZone(zone)
    setFormData({
      code: zone.code,
      nom: zone.nom,
      description: zone.description || "",
      statut: zone.statut,
      dateDebut: zone.dateDebut ? zone.dateDebut.split("T")[0] : "",
      dateFin: zone.dateFin ? zone.dateFin.split("T")[0] : ""
    })
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#002E5D]" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#002E5D]">Gestion des Zones</h1>
          <p className="text-gray-600">{zones.length} zone(s)</p>
        </div>
        {canManageZones && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button className="bg-[#002E5D] hover:bg-[#001a36]">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Zone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingZone ? "Modifier la zone" : "Nouvelle zone"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Code *</Label>
                      <Input
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="ex: OSBL, JFC1"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Statut</Label>
                      <Select value={formData.statut} onValueChange={(v) => setFormData({ ...formData, statut: v as StatutZone })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statutZoneLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Nom *</Label>
                    <Input
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Date début</Label>
                      <Input
                        type="date"
                        value={formData.dateDebut}
                        onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Date fin</Label>
                      <Input
                        type="date"
                        value={formData.dateFin}
                        onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#002E5D] hover:bg-[#001a36]">
                    {editingZone ? "Modifier" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <Card key={zone.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatutColor(zone.statut)}`}></div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#002E5D]" />
                      {zone.code}
                    </CardTitle>
                    <CardDescription>{zone.nom}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">
                  {statutZoneLabels[zone.statut]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {zone.description && (
                <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
              )}
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <Users className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                  <p className="text-lg font-bold">{zone._count?.users || 0}</p>
                  <p className="text-xs text-gray-500">Agents</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <Activity className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                  <p className="text-lg font-bold">{zone._count?.equipes || 0}</p>
                  <p className="text-xs text-gray-500">Équipes</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <ClipboardList className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                  <p className="text-lg font-bold">{zone._count?.taches || 0}</p>
                  <p className="text-xs text-gray-500">Tâches</p>
                </div>
              </div>

              {zone.dateDebut && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(zone.dateDebut), "dd/MM/yyyy", { locale: fr })}
                  {zone.dateFin && (
                    <>
                      <span>→</span>
                      {format(new Date(zone.dateFin), "dd/MM/yyyy", { locale: fr })}
                    </>
                  )}
                </div>
              )}

              {canManageZones && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(zone)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(zone.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {zones.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucune zone créée</p>
          </div>
        )}
      </div>
    </div>
  )
}
