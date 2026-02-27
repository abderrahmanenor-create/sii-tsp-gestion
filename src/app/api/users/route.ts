import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"
import { hashPassword } from "@/lib/auth"

// GET - List users
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        photo: true,
        role: true,
        actif: true,
        equipeId: true,
        zoneId: true,
        createdAt: true,
        equipe: {
          select: { id: true, nom: true }
        },
        zone: {
          select: { id: true, nom: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, nom, prenom, telephone, photo, role, equipeId, zoneId } = body

    if (!email || !password || !nom || !prenom) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        telephone,
        photo,
        role: role || Role.AGENT,
        equipeId,
        zoneId
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        photo: true,
        role: true,
        actif: true,
        equipeId: true,
        zoneId: true,
        createdAt: true
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
