import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role, StatutZone } from "@prisma/client"

// GET - List zones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statut = searchParams.get("statut") as StatutZone | null

    const where: Record<string, unknown> = {}
    if (statut) where.statut = statut

    const zones = await db.zone.findMany({
      where,
      include: {
        _count: {
          select: { users: true, equipes: true, taches: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(zones)
  } catch (error) {
    console.error("Error fetching zones:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create zone
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.CHEF_PROJET)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { code, nom, description, statut, dateDebut, dateFin } = body

    if (!code || !nom) {
      return NextResponse.json({ error: "Code et nom requis" }, { status: 400 })
    }

    // Check if zone code already exists
    const existingZone = await db.zone.findUnique({
      where: { code }
    })

    if (existingZone) {
      return NextResponse.json({ error: "Une zone avec ce code existe déjà" }, { status: 400 })
    }

    const zone = await db.zone.create({
      data: {
        code,
        nom,
        description,
        statut: statut || StatutZone.EN_COURS,
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null
      }
    })

    return NextResponse.json(zone, { status: 201 })
  } catch (error) {
    console.error("Error creating zone:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
