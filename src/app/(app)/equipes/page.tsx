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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Loader2,
  User,
  MapPin
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Role, roleLabels } from "@/lib/types"

interface Equipe {
  id: string
  nom: string
  description?: string | null
  zoneId: string
  chefEquipeId?: string | null
  zone?: { id: string; nom: string; code: string }
  chefEquipe?: { id: string; nom: string; prenom: string; photo?: string | null } | null
  _count?: { membres: number }
  membres?: User[]
}

interface User {
  id: string
  nom: string
  prenom: string
  photo?: string | null
  role: Role
  equipeId?: string | null
}

interface Zone {
  id: string
  code: string
  nom: string
}

export default function EquipesPage() {
  const { user, canManageEquipes } = useAuth()
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEquipe, setEditingEquipe] = useState<Equipe | null>(null)
  const [selectedEquipe, setSelectedEquipe] = useState<Equipe | null>(null)
  const [membersDialogOpen, setMembersDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    zoneId: "",
    chefEquipeId: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [equipesRes, usersRes, zonesRes] = await Promise.all([
        fetch("/api/equipes"),
        fetch("/api/users"),
        fetch("/api/zones")
      ])

      if (equipesRes.ok) setEquipes(await equipesRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
      if (zonesRes.ok) setZones(await zonesRes.json())
    } catch (error) {
      console.error("Erreur chargement données:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingEquipe ? `/api/equipes/${editingEquipe.id}` : "/api/equipes"
      const method = editingEquipe ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          chefEquipeId: formData.chefEquipeId || null
        })
      })

      if (res.ok) {
        toast.success(editingEquipe ? "Équipe modifiée" : "Équipe créée")
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
    if (!confirm("Supprimer cette équipe ?")) return

    try {
      const res = await fetch(`/api/equipes/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Équipe supprimée")
        fetchData()
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleAddMember = async (equipeId: string, userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipeId })
      })

      if (res.ok) {
        toast.success("Membre ajouté")
        fetchData()
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout")
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipeId: null })
      })

      if (res.ok) {
        toast.success("Membre retiré")
        fetchData()
      }
    } catch (error) {
      toast.error("Erreur lors du retrait")
    }
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      description: "",
      zoneId: "",
      chefEquipeId: ""
    })
    setEditingEquipe(null)
  }

  const openEditDialog = (equipe: Equipe) => {
    setEditingEquipe(equipe)
    setFormData({
      nom: equipe.nom,
      description: equipe.description || "",
      zoneId: equipe.zoneId,
      chefEquipeId: equipe.chefEquipeId || ""
    })
    setDialogOpen(true)
  }

  const openMembersDialog = (equipe: Equipe) => {
    setSelectedEquipe(equipe)
    setMembersDialogOpen(true)
  }

  const availableUsers = users.filter(u => !u.equipeId || u.equipeId === selectedEquipe?.id)

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
          <h1 className="text-3xl font-bold text-[#002E5D]">Gestion des Équipes</h1>
          <p className="text-gray-600">{equipes.length} équipe(s)</p>
        </div>
        {canManageEquipes && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button className="bg-[#002E5D] hover:bg-[#001a36]">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Équipe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingEquipe ? "Modifier l'équipe" : "Nouvelle équipe"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                      <Label>Zone *</Label>
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
                      <Label>Chef d'équipe</Label>
                      <Select value={formData.chefEquipeId} onValueChange={(v) => setFormData({ ...formData, chefEquipeId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.filter(u => u.role === Role.SUPERVISEUR || u.role === Role.CHEF_PROJET).map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.prenom} {u.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#002E5D] hover:bg-[#001a36]">
                    {editingEquipe ? "Modifier" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipes.map((equipe) => (
          <Card key={equipe.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#002E5D]" />
                    {equipe.nom}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {equipe.zone?.nom}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {equipe._count?.membres || 0} membre(s)
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {equipe.description && (
                <p className="text-sm text-gray-600 mb-3">{equipe.description}</p>
              )}
              
              {equipe.chefEquipe && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={equipe.chefEquipe.photo || ""} />
                    <AvatarFallback>
                      {equipe.chefEquipe.prenom[0]}{equipe.chefEquipe.nom[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{equipe.chefEquipe.prenom} {equipe.chefEquipe.nom}</p>
                    <p className="text-xs text-gray-500">Chef d'équipe</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openMembersDialog(equipe)}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Membres
                </Button>
                {canManageEquipes && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(equipe)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(equipe.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {equipes.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucune équipe créée</p>
          </div>
        )}
      </div>

      {/* Members Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Membres de l'équipe: {selectedEquipe?.nom}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Current Members */}
            <Label className="mb-2 block">Membres actuels</Label>
            <ScrollArea className="h-48 border rounded-lg p-2 mb-4">
              {selectedEquipe?.membres?.length === 0 && (
                <p className="text-gray-500 text-center py-4">Aucun membre</p>
              )}
              <div className="space-y-2">
                {selectedEquipe?.membres?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.photo || ""} />
                        <AvatarFallback>
                          {member.prenom[0]}{member.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.prenom} {member.nom}</p>
                        <p className="text-xs text-gray-500">{roleLabels[member.role]}</p>
                      </div>
                    </div>
                    {canManageEquipes && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Add Members */}
            {canManageEquipes && (
              <>
                <Label className="mb-2 block">Ajouter un membre</Label>
                <ScrollArea className="h-32 border rounded-lg p-2">
                  <div className="space-y-2">
                    {availableUsers
                      .filter(u => u.equipeId !== selectedEquipe?.id)
                      .map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={u.photo || ""} />
                              <AvatarFallback className="text-xs">
                                {u.prenom[0]}{u.nom[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{u.prenom} {u.nom}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectedEquipe && handleAddMember(selectedEquipe.id, u.id)}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
