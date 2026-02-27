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
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mic,
  Square,
  Play,
  Pause,
  Loader2,
  Trash2,
  Plus,
  ClipboardList,
  User,
  Users,
  Clock,
  Volume2,
  FileText
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

interface NoteVocale {
  id: string
  audioUrl: string
  transcription?: string | null
  duree: number
  userId: string
  tacheId?: string | null
  createdAt: string
  user?: { id: string; nom: string; prenom: string; photo?: string | null }
  tache?: { id: string; titre: string; statut: string } | null
}

interface User {
  id: string
  nom: string
  prenom: string
}

interface Equipe {
  id: string
  nom: string
}

export default function NotesVocalesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<NoteVocale[]>([])
  const [loading, setLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duree, setDuree] = useState(0)
  const [createTaskDialog, setCreateTaskDialog] = useState(false)
  const [selectedNote, setSelectedNote] = useState<NoteVocale | null>(null)
  const [playingNote, setPlayingNote] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Task creation form
  const [taskForm, setTaskForm] = useState({
    titre: "",
    description: "",
    type: "MECANIQUE",
    priorite: "NORMALE",
    assigneeId: "",
    equipeId: ""
  })

  useEffect(() => {
    fetchNotes()
    fetchUsers()
    fetchEquipes()
  }, [])

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes-vocales")
      if (res.ok) {
        setNotes(await res.json())
      }
    } catch (error) {
      console.error("Erreur chargement notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) setUsers(await res.json())
    } catch (error) {
      console.error("Erreur chargement users:", error)
    }
  }

  const fetchEquipes = async () => {
    try {
      const res = await fetch("/api/equipes")
      if (res.ok) setEquipes(await res.json())
    } catch (error) {
      console.error("Erreur chargement equipes:", error)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuree(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuree(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Erreur accès microphone:", error)
      toast.error("Impossible d'accéder au microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const transcribeAudio = async () => {
    if (!audioBlob) return

    setIsTranscribing(true)
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")
      formData.append("duree", duree.toString())

      const res = await fetch("/api/notes-vocales", {
        method: "POST",
        body: formData
      })

      if (res.ok) {
        const note = await res.json()
        setNotes(prev => [note, ...prev])
        setAudioBlob(null)
        setAudioUrl(null)
        setDuree(0)
        toast.success("Note vocale enregistrée")
      } else {
        const error = await res.json()
        toast.error(error.error || "Erreur lors de la transcription")
      }
    } catch (error) {
      console.error("Erreur transcription:", error)
      toast.error("Erreur lors de la transcription")
    } finally {
      setIsTranscribing(false)
    }
  }

  const deleteNote = async (id: string) => {
    if (!confirm("Supprimer cette note ?")) return

    try {
      const res = await fetch(`/api/notes-vocales/${id}`, { method: "DELETE" })
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== id))
        toast.success("Note supprimée")
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const openCreateTask = (note: NoteVocale) => {
    setSelectedNote(note)
    setTaskForm({
      titre: note.transcription?.slice(0, 100) || "",
      description: note.transcription || "",
      type: "MECANIQUE",
      priorite: "NORMALE",
      assigneeId: "",
      equipeId: ""
    })
    setCreateTaskDialog(true)
  }

  const createTaskFromNote = async () => {
    if (!selectedNote || !taskForm.titre) return

    try {
      const res = await fetch(`/api/notes-vocales/${selectedNote.id}/tache`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm)
      })

      if (res.ok) {
        toast.success("Tâche créée depuis la note")
        setCreateTaskDialog(false)
        fetchNotes()
      } else {
        toast.error("Erreur lors de la création de la tâche")
      }
    } catch (error) {
      toast.error("Erreur lors de la création de la tâche")
    }
  }

  const playAudio = (noteId: string, audioUrl: string) => {
    if (playingNote === noteId) {
      if (audioRef.current) {
        audioRef.current.pause()
        setPlayingNote(null)
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
      setPlayingNote(noteId)
      audioRef.current.onended = () => setPlayingNote(null)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
          <h1 className="text-3xl font-bold text-[#002E5D]">Notes Vocales</h1>
          <p className="text-gray-600">Enregistrez et convertissez vos notes en tâches</p>
        </div>
      </div>

      {/* Recording Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Enregistrement
          </CardTitle>
          <CardDescription>
            Cliquez sur le bouton pour démarrer l'enregistrement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {!isRecording && !audioBlob && (
              <Button
                size="lg"
                className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600"
                onClick={startRecording}
              >
                <Mic className="w-12 h-12" />
              </Button>
            )}

            {isRecording && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                  <Mic className="w-12 h-12 text-white" />
                </div>
                <div className="text-2xl font-mono">{formatDuration(duree)}</div>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={stopRecording}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Arrêter
                </Button>
              </div>
            )}

            {audioBlob && audioUrl && (
              <div className="w-full max-w-md">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Durée: {formatDuration(duree)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAudioBlob(null)
                        setAudioUrl(null)
                        setDuree(0)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <audio src={audioUrl} controls className="w-full" />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-[#002E5D] hover:bg-[#001a36]"
                    onClick={transcribeAudio}
                    disabled={isTranscribing}
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Transcription...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Transcrire et Sauvegarder
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setAudioBlob(null)
                    setAudioUrl(null)
                    setDuree(0)
                  }}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle>Notes enregistrées</CardTitle>
          <CardDescription>
            {notes.length} note(s) • Cliquez sur "Créer Tâche" pour convertir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id} className="border-l-4 border-l-[#002E5D]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={note.user?.photo || ""} />
                          <AvatarFallback>
                            {note.user?.prenom[0]}{note.user?.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {note.user?.prenom} {note.user?.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(note.createdAt), "dd MMM yyyy à HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(note.duree)}
                        </Badge>
                        {note.tache && (
                          <Badge className="bg-green-500">
                            <ClipboardList className="w-3 h-3 mr-1" />
                            Tâche créée
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(note.id, note.audioUrl)}
                      >
                        {playingNote === note.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <Volume2 className="w-4 h-4 ml-1" />
                      </Button>
                    </div>

                    {note.transcription && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-sm whitespace-pre-wrap">{note.transcription}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {note.tache ? (
                          <span className="text-green-600">
                            → Tâche: {note.tache.titre}
                          </span>
                        ) : (
                          <span className="text-gray-400">Non convertie</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!note.tache && note.transcription && (
                          <Button
                            size="sm"
                            className="bg-[#002E5D] hover:bg-[#001a36]"
                            onClick={() => openCreateTask(note)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Créer Tâche
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {notes.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Mic className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune note vocale enregistrée</p>
                  <p className="text-sm">Cliquez sur le bouton rouge pour commencer</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={createTaskDialog} onOpenChange={setCreateTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une tâche depuis la note</DialogTitle>
            <DialogDescription>
              La note vocale sera convertie en tâche Kanban
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Titre *</Label>
              <Input
                value={taskForm.titre}
                onChange={(e) => setTaskForm({ ...taskForm, titre: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={taskForm.type} onValueChange={(v) => setTaskForm({ ...taskForm, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MECANIQUE">Mécanique</SelectItem>
                    <SelectItem value="ELECTRICITE">Électricité</SelectItem>
                    <SelectItem value="GENERAL">Général</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Priorité</Label>
                <Select value={taskForm.priorite} onValueChange={(v) => setTaskForm({ ...taskForm, priorite: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASSE">Basse</SelectItem>
                    <SelectItem value="NORMALE">Normale</SelectItem>
                    <SelectItem value="HAUTE">Haute</SelectItem>
                    <SelectItem value="URGENTE">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Assigner à un utilisateur
                </Label>
                <Select value={taskForm.assigneeId} onValueChange={(v) => setTaskForm({ ...taskForm, assigneeId: v })}>
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
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Ou à une équipe
                </Label>
                <Select value={taskForm.equipeId} onValueChange={(v) => setTaskForm({ ...taskForm, equipeId: v })}>
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
            <Button variant="outline" onClick={() => setCreateTaskDialog(false)}>
              Annuler
            </Button>
            <Button className="bg-[#002E5D] hover:bg-[#001a36]" onClick={createTaskFromNote}>
              Créer la tâche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
