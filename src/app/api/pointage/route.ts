import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CodePointage, Role } from "@prisma/client"

// GET - List pointages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const dateDebut = searchParams.get("dateDebut")
    const dateFin = searchParams.get("dateFin")
    const userId = searchParams.get("userId")
    const zoneId = searchParams.get("zoneId")

    const where: Record<string, unknown> = {}
    
    // Agents can only see their own pointages
    if (session.user.role === Role.AGENT) {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    if (zoneId) where.zoneId = zoneId

    if (date) {
      const dateObj = new Date(date)
      const nextDay = new Date(dateObj)
      nextDay.setDate(nextDay.getDate() + 1)
      where.date = {
        gte: dateObj,
        lt: nextDay
      }
    } else if (dateDebut && dateFin) {
      where.date = {
        gte: new Date(dateDebut),
        lte: new Date(dateFin)
      }
    }

    const pointages = await db.pointage.findMany({
      where,
      include: {
        user: { select: { id: true, nom: true, prenom: true, photo: true, role: true } },
        zone: { select: { id: true, nom: true, code: true } }
      },
      orderBy: { date: "desc" }
    })

    return NextResponse.json(pointages)
  } catch (error) {
    console.error("Error fetching pointages:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create pointage
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    let { 
      userId, 
      zoneId, 
      date, 
      heureArrivee, 
      heureDepart, 
      codePointage, 
      heuresTravaillees, 
      heuresSup, 
      motif 
    } = body

    // Agents can only create pointage for themselves
    if (session.user.role === Role.AGENT) {
      userId = session.user.id
      zoneId = session.user.zoneId
    }

    if (!userId || !zoneId || !date) {
      return NextResponse.json({ error: "Utilisateur, zone et date requis" }, { status: 400 })
    }

    // Check if pointage already exists for this user and date
    const existingPointage = await db.pointage.findFirst({
      where: {
        userId,
        date: new Date(date)
      }
    })

    if (existingPointage) {
      return NextResponse.json({ error: "Un pointage existe déjà pour cette date" }, { status: 400 })
    }

    const pointage = await db.pointage.create({
      data: {
        userId,
        zoneId,
        date: new Date(date),
        heureArrivee: heureArrivee ? new Date(heureArrivee) : null,
        heureDepart: heureDepart ? new Date(heureDepart) : null,
        codePointage: codePointage || CodePointage.PRESENT,
        heuresTravaillees,
        heuresSup,
        motif
      },
      include: {
        user: { select: { id: true, nom: true, prenom: true } },
        zone: { select: { id: true, nom: true } }
      }
    })

    return NextResponse.json(pointage, { status: 201 })
  } catch (error) {
    console.error("Error creating pointage:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
