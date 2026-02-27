"use client"

import { useAuth } from "@/hooks/use-session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  UserCog,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Mail,
  Phone,
  Shield
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Role, roleLabels } from "@/lib/types"

interface User {
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

interface Equipe {
  id: string
  nom: string
}

interface Zone {
  id: string
  code: string
  nom: string
}

const getRoleColor = (role: Role) => {
  switch (role) {
    case Role.ADMIN: return "bg-red-100 text-red-700"
    case Role.CHEF_PROJET: return "bg-blue-100 text-blue-700"
    case Role.RH: return "bg-green-100 text-green-700"
    case Role.SUPERVISEUR: return "bg-purple-100 text-purple-700"
    case Role.AGENT: return "bg-gray-100 text-gray-700"
  }
}

export default function UtilisateursPage() {
  const { user, isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    email: "",
    nom: "",
    prenom: "",
    telephone: "",
    role: Role.AGENT,
    actif: true,
    equipeId: "",
    zoneId: "",
    password: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, equipesRes, zonesRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/equipes"),
        fetch("/api/zones")
      ])

      if (usersRes.ok) setUsers(await usersRes.json())
      if (equipesRes.ok) setEquipes(await equipesRes.json())
      if (zonesRes.ok) setZones(await zonesRes.json())
    } catch (error) {
      console.error("Erreur chargement données:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.prenom.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/auth/register"
      const method = editingUser ? "PUT" : "POST"
      
      const body = {
        ...formData,
        equipeId: formData.equipeId || null,
        zoneId: formData.zoneId || null,
        password: formData.password || undefined
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(editingUser ? "Utilisateur modifié" : "Utilisateur créé")
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        const error = await res.json()
        toast.error(error.error || "Erreur lors de l'enregistrement")
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleToggleActive = async (userId: string, actif: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actif: !actif })
      })

      if (res.ok) {
        toast.success(actif ? "Utilisateur désactivé" : "Utilisateur réactivé")
        fetchData()
      }
    } catch (error) {
      toast.error("Erreur lors de la modification")
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      nom: "",
      prenom: "",
      telephone: "",
      role: Role.AGENT,
      actif: true,
      equipeId: "",
      zoneId: "",
      password: ""
    })
    setEditingUser(null)
  }

  const openEditDialog = (u: User) => {
    setEditingUser(u)
    setFormData({
      email: u.email,
      nom: u.nom,
      prenom: u.prenom,
      telephone: u.telephone || "",
      role: u.role,
      actif: u.actif,
      equipeId: u.equipeId || "",
      zoneId: u.zoneId || "",
      password: ""
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
          <h1 className="text-3xl font-bold text-[#002E5D]">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">{users.length} utilisateur(s)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-[#002E5D] hover:bg-[#001a36]">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Prénom *</Label>
                    <Input
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Nom *</Label>
                    <Input
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {!editingUser && (
                  <div className="grid gap-2">
                    <Label>Mot de passe *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      placeholder="Min 6 caractères"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Téléphone</Label>
                    <Input
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Rôle *</Label>
                    <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as Role })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([key, label]) => (
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
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="actif"
                    checked={formData.actif}
                    onCheckedChange={(checked) => setFormData({ ...formData, actif: !!checked })}
                  />
                  <Label htmlFor="actif">Utilisateur actif</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#002E5D] hover:bg-[#001a36]">
                  {editingUser ? "Modifier" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Zone / Équipe</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} className={!u.actif ? "bg-gray-50 opacity-60" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={u.photo || ""} />
                          <AvatarFallback>
                            {u.prenom[0]}{u.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.prenom} {u.nom}</p>
                          <p className="text-xs text-gray-500">
                            Créé le {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {u.email}
                        </div>
                        {u.telephone && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="w-3 h-3" />
                            {u.telephone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(u.role)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {roleLabels[u.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {u.zone && (
                          <p className="text-gray-600">{u.zone.nom}</p>
                        )}
                        {u.equipe && (
                          <p className="text-gray-400 text-xs">{u.equipe.nom}</p>
                        )}
                        {!u.zone && !u.equipe && (
                          <span className="text-gray-400">Non assigné</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.actif ? "default" : "secondary"}>
                        {u.actif ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(u)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(u.id, u.actif)}
                          className={u.actif ? "text-red-500" : "text-green-500"}
                        >
                          {u.actif ? <Trash2 className="w-4 h-4" /> : "Réactiver"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
