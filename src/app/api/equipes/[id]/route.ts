import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

// GET - Get equipe by ID
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

    const equipe = await db.equipe.findUnique({
      where: { id },
      include: {
        zone: { select: { id: true, nom: true, code: true } },
        chefEquipe: { select: { id: true, nom: true, prenom: true, photo: true } },
        membres: {
          select: { id: true, nom: true, prenom: true, role: true, photo: true }
        },
        taches: {
          select: { id: true, titre: true, statut: true },
          take: 10,
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!equipe) {
      return NextResponse.json({ error: "Équipe non trouvée" }, { status: 404 })
    }

    return NextResponse.json(equipe)
  } catch (error) {
    console.error("Error fetching equipe:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT - Update equipe
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
    const { nom, description, zoneId, chefEquipeId } = body

    const updateData: Record<string, unknown> = {}
    if (nom) updateData.nom = nom
    if (description !== undefined) updateData.description = description
    if (zoneId) updateData.zoneId = zoneId
    if (chefEquipeId !== undefined) updateData.chefEquipeId = chefEquipeId

    const equipe = await db.equipe.update({
      where: { id },
      data: updateData,
      include: {
        zone: { select: { id: true, nom: true } },
        chefEquipe: { select: { id: true, nom: true, prenom: true } }
      }
    })

    return NextResponse.json(equipe)
  } catch (error) {
    console.error("Error updating equipe:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Delete equipe (admin only)
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

    await db.equipe.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting equipe:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
