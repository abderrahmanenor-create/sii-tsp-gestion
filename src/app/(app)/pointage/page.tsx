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
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CalendarClock,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Filter
} from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend, addMonths, subMonths } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { CodePointage, codePointageLabels, Role } from "@/lib/types"

interface Pointage {
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
  createdAt: string
  user?: { id: string; nom: string; prenom: string; photo?: string | null; role: Role }
  zone?: { id: string; nom: string; code: string }
}

interface User {
  id: string
  nom: string
  prenom: string
  photo?: string | null
  role: Role
  zoneId?: string | null
  zone?: { id: string; nom: string }
}

interface Zone {
  id: string
  code: string
  nom: string
}

const getCodePointageColor = (code: CodePointage) => {
  switch (code) {
    case CodePointage.PRESENT: return "bg-green-100 text-green-700 border-green-200"
    case CodePointage.ABSENT: return "bg-red-100 text-red-700 border-red-200"
    case CodePointage.CONGE: return "bg-blue-100 text-blue-700 border-blue-200"
    case CodePointage.MALADIE: return "bg-purple-100 text-purple-700 border-purple-200"
    case CodePointage.FORMATION: return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case CodePointage.RETARD: return "bg-orange-100 text-orange-700 border-orange-200"
    case CodePointage.DEPART_ANTICIPE: return "bg-pink-100 text-pink-700 border-pink-200"
  }
}

export default function PointagePage() {
  const { user, canValidatePointage } = useAuth()
  const [pointages, setPointages] = useState<Pointage[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedZone, setSelectedZone] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  
  // Dialog
  const [pointageDialogOpen, setPointageDialogOpen] = useState(false)
  const [selectedPointage, setSelectedPointage] = useState<Pointage | null>(null)
  const [pointageForm, setPointageForm] = useState({
    codePointage: CodePointage.PRESENT,
    heureArrivee: "08:00",
    heureDepart: "17:00",
    heuresSup: 0,
    motif: ""
  })

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const [pointagesRes, usersRes, zonesRes] = await Promise.all([
        fetch(`/api/pointage?date=${dateStr}`),
        fetch("/api/users"),
        fetch("/api/zones")
      ])

      if (pointagesRes.ok) setPointages(await pointagesRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
      if (zonesRes.ok) setZones(await zonesRes.json())
    } catch (error) {
      console.error("Erreur chargement données:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPointages = useMemo(() => {
    return pointages.filter(p => {
      if (selectedZone !== "all" && p.zoneId !== selectedZone) return false
      if (selectedUser !== "all" && p.userId !== selectedUser) return false
      return true
    })
  }, [pointages, selectedZone, selectedUser])

  const stats = useMemo(() => {
    const presents = filteredPointages.filter(p => p.codePointage === CodePointage.PRESENT).length
    const absents = filteredPointages.filter(p => p.codePointage === CodePointage.ABSENT).length
    const autres = filteredPointages.length - presents - absents
    const totalHeures = filteredPointages.reduce((sum, p) => sum + (p.heuresTravaillees || 0), 0)
    const totalHeuresSup = filteredPointages.reduce((sum, p) => sum + (p.heuresSup || 0), 0)
    
    return { presents, absents, autres, totalHeures, totalHeuresSup }
  }, [filteredPointages])

  const openPointageDialog = (pointage: Pointage) => {
    setSelectedPointage(pointage)
    setPointageForm({
      codePointage: pointage.codePointage,
      heureArrivee: pointage.heureArrivee ? pointage.heureArrivee.slice(11, 16) : "08:00",
      heureDepart: pointage.heureDepart ? pointage.heureDepart.slice(11, 16) : "17:00",
      heuresSup: pointage.heuresSup || 0,
      motif: pointage.motif || ""
    })
    setPointageDialogOpen(true)
  }

  const handleUpdatePointage = async () => {
    if (!selectedPointage) return

    try {
      const res = await fetch(`/api/pointage/${selectedPointage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codePointage: pointageForm.codePointage,
          heureArrivee: pointageForm.heureArrivee ? new Date(`${format(selectedDate, "yyyy-MM-dd")}T${pointageForm.heureArrivee}:00`).toISOString() : null,
          heureDepart: pointageForm.heureDepart ? new Date(`${format(selectedDate, "yyyy-MM-dd")}T${pointageForm.heureDepart}:00`).toISOString() : null,
          heuresSup: pointageForm.heuresSup,
          motif: pointageForm.motif
        })
      })

      if (res.ok) {
        toast.success("Pointage mis à jour")
        setPointageDialogOpen(false)
        fetchData()
      } else {
        toast.error("Erreur lors de la mise à jour")
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const handleValidatePointage = async (pointageId: string) => {
    try {
      const res = await fetch(`/api/pointage/${pointageId}/valider`, {
        method: "POST"
      })

      if (res.ok) {
        toast.success("Pointage validé")
        fetchData()
      } else {
        toast.error("Erreur lors de la validation")
      }
    } catch (error) {
      toast.error("Erreur lors de la validation")
    }
  }

  const handleValidateAll = async () => {
    const toValidate = filteredPointages.filter(p => !p.valide)
    for (const p of toValidate) {
      await handleValidatePointage(p.id)
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
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#002E5D]">Gestion du Pointage</h1>
          <p className="text-gray-600">
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex gap-2">
          {canValidatePointage && (
            <Button 
              variant="outline" 
              className="border-green-500 text-green-600"
              onClick={handleValidateAll}
              disabled={filteredPointages.filter(p => !p.valide).length === 0}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Valider tout
            </Button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-[#002E5D] text-[#002E5D]">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(selectedDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Présents</p>
                <p className="text-xl font-bold text-green-600">{stats.presents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Absents</p>
                <p className="text-xl font-bold text-red-600">{stats.absents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Autres</p>
                <p className="text-xl font-bold text-blue-600">{stats.autres}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Heures</p>
                <p className="text-xl font-bold text-purple-600">{stats.totalHeures.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Heures Sup.</p>
                <p className="text-xl font-bold text-orange-600">{stats.totalHeuresSup.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-500 self-center" />
        <Select value={selectedZone} onValueChange={setSelectedZone}>
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
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Utilisateur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.prenom} {u.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pointages Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Arrivée</TableHead>
                  <TableHead>Départ</TableHead>
                  <TableHead>Heures</TableHead>
                  <TableHead>H. Sup.</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPointages.map((pointage) => (
                  <TableRow key={pointage.id} className={!pointage.valide ? "bg-yellow-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={pointage.user?.photo || ""} />
                          <AvatarFallback>
                            {pointage.user?.prenom[0]}{pointage.user?.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{pointage.user?.prenom} {pointage.user?.nom}</p>
                          <p className="text-xs text-gray-500">{pointage.user?.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {pointage.zone?.nom || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCodePointageColor(pointage.codePointage)}>
                        {codePointageLabels[pointage.codePointage]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pointage.heureArrivee 
                        ? format(new Date(pointage.heureArrivee), "HH:mm")
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      {pointage.heureDepart 
                        ? format(new Date(pointage.heureDepart), "HH:mm")
                        : "-"
                      }
                    </TableCell>
                    <TableCell>{pointage.heuresTravaillees || 0}h</TableCell>
                    <TableCell>{pointage.heuresSup || 0}h</TableCell>
                    <TableCell>
                      {pointage.valide ? (
                        <Badge className="bg-green-500">Validé</Badge>
                      ) : (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                          En attente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPointageDialog(pointage)}
                        >
                          Modifier
                        </Button>
                        {canValidatePointage && !pointage.valide && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleValidatePointage(pointage.id)}
                          >
                            Valider
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPointages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      Aucun pointage pour cette date
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pointage Dialog */}
      <Dialog open={pointageDialogOpen} onOpenChange={setPointageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le pointage</DialogTitle>
            <DialogDescription>
              {selectedPointage?.user?.prenom} {selectedPointage?.user?.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Code de pointage</Label>
              <Select 
                value={pointageForm.codePointage} 
                onValueChange={(v) => setPointageForm({ ...pointageForm, codePointage: v as CodePointage })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(codePointageLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Heure d'arrivée</Label>
                <Input
                  type="time"
                  value={pointageForm.heureArrivee}
                  onChange={(e) => setPointageForm({ ...pointageForm, heureArrivee: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Heure de départ</Label>
                <Input
                  type="time"
                  value={pointageForm.heureDepart}
                  onChange={(e) => setPointageForm({ ...pointageForm, heureDepart: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Heures supplémentaires</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={pointageForm.heuresSup}
                onChange={(e) => setPointageForm({ ...pointageForm, heuresSup: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Motif / Note</Label>
              <Input
                value={pointageForm.motif}
                onChange={(e) => setPointageForm({ ...pointageForm, motif: e.target.value })}
                placeholder="Raison de l'absence, retard, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPointageDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-[#002E5D] hover:bg-[#001a36]" onClick={handleUpdatePointage}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
