import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

// GET - Get pointage by ID
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

    const pointage = await db.pointage.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nom: true, prenom: true, photo: true } },
        zone: { select: { id: true, nom: true, code: true } }
      }
    })

    if (!pointage) {
      return NextResponse.json({ error: "Pointage non trouvé" }, { status: 404 })
    }

    // Check access
    if (session.user.role === Role.AGENT && pointage.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    return NextResponse.json(pointage)
  } catch (error) {
    console.error("Error fetching pointage:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT - Update pointage
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
      heureArrivee, 
      heureDepart, 
      codePointage, 
      heuresTravaillees, 
      heuresSup, 
      motif,
      zoneId 
    } = body

    const updateData: Record<string, unknown> = {}
    if (heureArrivee !== undefined) updateData.heureArrivee = heureArrivee ? new Date(heureArrivee) : null
    if (heureDepart !== undefined) updateData.heureDepart = heureDepart ? new Date(heureDepart) : null
    if (codePointage) updateData.codePointage = codePointage
    if (heuresTravaillees !== undefined) updateData.heuresTravaillees = heuresTravaillees
    if (heuresSup !== undefined) updateData.heuresSup = heuresSup
    if (motif !== undefined) updateData.motif = motif
    if (zoneId) updateData.zoneId = zoneId

    const pointage = await db.pointage.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, nom: true, prenom: true } },
        zone: { select: { id: true, nom: true } }
      }
    })

    return NextResponse.json(pointage)
  } catch (error) {
    console.error("Error updating pointage:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
