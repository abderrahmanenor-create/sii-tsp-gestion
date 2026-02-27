import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

// GET - Get note vocale by ID
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

    const note = await db.noteVocale.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nom: true, prenom: true, photo: true } },
        tache: { 
          select: { 
            id: true, 
            titre: true, 
            statut: true,
            description: true 
          } 
        }
      }
    })

    if (!note) {
      return NextResponse.json({ error: "Note vocale non trouvée" }, { status: 404 })
    }

    // Check access
    if (session.user.role === Role.AGENT && note.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error fetching note vocale:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Delete note vocale
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

    const note = await db.noteVocale.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!note) {
      return NextResponse.json({ error: "Note vocale non trouvée" }, { status: 404 })
    }

    // Only owner or admin can delete
    if (session.user.role === Role.AGENT && note.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    await db.noteVocale.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting note vocale:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
