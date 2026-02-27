import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { StatutTache, Priorite, TypeTache } from "@prisma/client"

// POST - Create task from voice note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    const { 
      titre, 
      description, 
      priorite, 
      type, 
      dateEcheance, 
      zoneId, 
      assigneeId, 
      equipeId 
    } = body

    // Check if note exists and hasn't been converted to a task
    const note = await db.noteVocale.findUnique({
      where: { id },
      include: { tache: true }
    })

    if (!note) {
      return NextResponse.json({ error: "Note vocale non trouvée" }, { status: 404 })
    }

    if (note.tache) {
      return NextResponse.json({ error: "Cette note a déjà été convertie en tâche" }, { status: 400 })
    }

    // Create task linked to the voice note
    const tache = await db.tache.create({
      data: {
        titre: titre || `Tâche depuis note du ${new Date(note.createdAt).toLocaleDateString('fr-FR')}`,
        description: description || note.transcription || "",
        statut: StatutTache.A_FAIRE,
        priorite: priorite || Priorite.NORMALE,
        type: type || TypeTache.GENERAL,
        dateEcheance: dateEcheance ? new Date(dateEcheance) : null,
        zoneId,
        createurId: session.user.id,
        assigneeId,
        equipeId,
        noteVocaleId: id
      },
      include: {
        zone: { select: { id: true, nom: true } },
        createur: { select: { id: true, nom: true, prenom: true } },
        assignee: { select: { id: true, nom: true, prenom: true } },
        equipe: { select: { id: true, nom: true } },
        noteVocale: { select: { id: true, transcription: true, audioUrl: true } }
      }
    })

    return NextResponse.json(tache, { status: 201 })
  } catch (error) {
    console.error("Error creating tache from note:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
