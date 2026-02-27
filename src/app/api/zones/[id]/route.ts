import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

// GET - Get zone by ID
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

    const zone = await db.zone.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, nom: true, prenom: true, role: true }
        },
        equipes: {
          include: {
            _count: { select: { membres: true } }
          }
        },
        _count: {
          select: { taches: true, pointages: true }
        }
      }
    })

    if (!zone) {
      return NextResponse.json({ error: "Zone non trouvée" }, { status: 404 })
    }

    return NextResponse.json(zone)
  } catch (error) {
    console.error("Error fetching zone:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT - Update zone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.CHEF_PROJET)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { code, nom, description, statut, dateDebut, dateFin } = body

    const updateData: Record<string, unknown> = {}
    if (code) updateData.code = code
    if (nom) updateData.nom = nom
    if (description !== undefined) updateData.description = description
    if (statut) updateData.statut = statut
    if (dateDebut !== undefined) updateData.dateDebut = dateDebut ? new Date(dateDebut) : null
    if (dateFin !== undefined) updateData.dateFin = dateFin ? new Date(dateFin) : null

    const zone = await db.zone.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(zone)
  } catch (error) {
    console.error("Error updating zone:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Delete zone (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params

    await db.zone.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting zone:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
