import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { StatutTache, Priorite, TypeTache, Role } from "@prisma/client"

// GET - List taches
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statut = searchParams.get("statut") as StatutTache | null
    const priorite = searchParams.get("priorite") as Priorite | null
    const type = searchParams.get("type") as TypeTache | null
    const zoneId = searchParams.get("zoneId")
    const assigneeId = searchParams.get("assigneeId")
    const equipeId = searchParams.get("equipeId")

    const where: Record<string, unknown> = {}
    if (statut) where.statut = statut
    if (priorite) where.priorite = priorite
    if (type) where.type = type
    if (zoneId) where.zoneId = zoneId
    if (assigneeId) where.assigneeId = assigneeId
    if (equipeId) where.equipeId = equipeId

    // Agents can only see their assigned tasks
    if (session.user.role === Role.AGENT) {
      where.OR = [
        { assigneeId: session.user.id },
        { equipeId: session.user.equipeId }
      ]
    }

    const taches = await db.tache.findMany({
      where,
      include: {
        zone: { select: { id: true, nom: true, code: true } },
        createur: { select: { id: true, nom: true, prenom: true } },
        assignee: { select: { id: true, nom: true, prenom: true, photo: true } },
        equipe: { select: { id: true, nom: true } },
        noteVocale: { select: { id: true, transcription: true } }
      },
      orderBy: [
        { priorite: "desc" },
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json(taches)
  } catch (error) {
    console.error("Error fetching taches:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create tache
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

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
      equipeId,
      noteVocaleId 
    } = body

    if (!titre) {
      return NextResponse.json({ error: "Titre requis" }, { status: 400 })
    }

    const tache = await db.tache.create({
      data: {
        titre,
        description,
        statut: statut || StatutTache.A_FAIRE,
        priorite: priorite || Priorite.NORMALE,
        type: type || TypeTache.MECANIQUE,
        dateEcheance: dateEcheance ? new Date(dateEcheance) : null,
        zoneId,
        createurId: session.user.id,
        assigneeId,
        equipeId,
        noteVocaleId
      },
      include: {
        zone: { select: { id: true, nom: true } },
        createur: { select: { id: true, nom: true, prenom: true } },
        assignee: { select: { id: true, nom: true, prenom: true } },
        equipe: { select: { id: true, nom: true } }
      }
    })

    return NextResponse.json(tache, { status: 201 })
  } catch (error) {
    console.error("Error creating tache:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
