import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"
import { hashPassword } from "@/lib/auth"

// GET - Get user by ID
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

    const user = await db.user.findUnique({
      where: { id },
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
        updatedAt: true,
        equipe: {
          select: { id: true, nom: true }
        },
        zone: {
          select: { id: true, nom: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT - Update user
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
    
    // Only admin can update other users, or user can update themselves
    if (session.user.role !== Role.ADMIN && session.user.id !== id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, nom, prenom, telephone, photo, role, equipeId, zoneId, actif } = body

    // Only admin can change role and actif status
    const updateData: Record<string, unknown> = {}
    
    if (email) updateData.email = email
    if (password) updateData.password = await hashPassword(password)
    if (nom) updateData.nom = nom
    if (prenom) updateData.prenom = prenom
    if (telephone !== undefined) updateData.telephone = telephone
    if (photo !== undefined) updateData.photo = photo
    if (equipeId !== undefined) updateData.equipeId = equipeId
    if (zoneId !== undefined) updateData.zoneId = zoneId

    if (session.user.role === Role.ADMIN) {
      if (role) updateData.role = role
      if (actif !== undefined) updateData.actif = actif
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
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
        updatedAt: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Deactivate user (admin only)
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

    // Soft delete - just deactivate
    const user = await db.user.update({
      where: { id },
      data: { actif: false },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        actif: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error deactivating user:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
