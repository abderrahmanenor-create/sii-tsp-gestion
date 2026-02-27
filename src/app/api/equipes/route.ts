import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

// GET - List equipes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const zoneId = searchParams.get("zoneId")

    const where: Record<string, unknown> = {}
    if (zoneId) where.zoneId = zoneId

    const equipes = await db.equipe.findMany({
      where,
      include: {
        zone: { select: { id: true, nom: true, code: true } },
        chefEquipe: { select: { id: true, nom: true, prenom: true } },
        _count: { select: { membres: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(equipes)
  } catch (error) {
    console.error("Error fetching equipes:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create equipe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.CHEF_PROJET)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { nom, description, zoneId, chefEquipeId } = body

    if (!nom || !zoneId) {
      return NextResponse.json({ error: "Nom et zone requis" }, { status: 400 })
    }

    const equipe = await db.equipe.create({
      data: {
        nom,
        description,
        zoneId,
        chefEquipeId
      },
      include: {
        zone: { select: { id: true, nom: true } },
        chefEquipe: { select: { id: true, nom: true, prenom: true } }
      }
    })

    return NextResponse.json(equipe, { status: 201 })
  } catch (error) {
    console.error("Error creating equipe:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
