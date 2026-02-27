import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role, StatutTache } from "@prisma/client"

// GET - Get tache by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params

    const tache = await db.tache.findUnique({
      where: { id },
      include: {
        zone: { select: { id: true, nom: true, code: true } },
        createur: { select: { id: true, nom: true, prenom: true, photo: true } },
        assignee: { select: { id: true, nom: true, prenom: true, photo: true } },
        equipe: { 
          select: { 
            id: true, 
            nom: true,
            membres: { select: { id: true, nom: true, prenom: true } }
          } 
        },
        noteVocale: { select: { id: true, transcription: true, audioUrl: true } }
      }
    })

    if (!tache) {
      return NextResponse.json({ error: "Tâche non trouvée" }, { status: 404 })
    }

    // Check access for agents
    if (session.user.role === Role.AGENT) {
      const hasAccess = tache.assigneeId === session.user.id || 
                        tache.equipeId === session.user.equipeId
      if (!hasAccess) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
      }
    }

    return NextResponse.json(tache)
  } catch (error) {
    console.error("Error fetching tache:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT - Update tache
export async function PUT(
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
      statut, 
      priorite, 
      type, 
      dateEcheance, 
      zoneId, 
      assigneeId, 
      equipeId 
    } = body

    const updateData: Record<string, unknown> = {}
    if (titre) updateData.titre = titre
    if (description !== undefined) updateData.description = description
    if (statut) updateData.statut = statut
    if (priorite) updateData.priorite = priorite
    if (type) updateData.type = type
    if (dateEcheance !== undefined) updateData.dateEcheance = dateEcheance ? new Date(dateEcheance) : null
    if (zoneId !== undefined) updateData.zoneId = zoneId
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId
    if (equipeId !== undefined) updateData.equipeId = equipeId

    const tache = await db.tache.update({
      where: { id },
      data: updateData,
      include: {
        zone: { select: { id: true, nom: true } },
        createur: { select: { id: true, nom: true, prenom: true } },
        assignee: { select: { id: true, nom: true, prenom: true } },
        equipe: { select: { id: true, nom: true } }
      }
    })

    return NextResponse.json(tache)
  } catch (error) {
    console.error("Error updating tache:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Delete tache
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params

    // Only admin, chef projet, or creator can delete
    const tache = await db.tache.findUnique({
      where: { id },
      select: { createurId: true }
    })

    if (!tache) {
      return NextResponse.json({ error: "Tâche non trouvée" }, { status: 404 })
    }

    if (session.user.role === Role.AGENT && tache.createurId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    // Soft delete - just mark as cancelled
    const deletedTache = await db.tache.update({
      where: { id },
      data: { statut: StatutTache.ANNULE }
    })

    return NextResponse.json(deletedTache)
  } catch (error) {
    console.error("Error deleting tache:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
