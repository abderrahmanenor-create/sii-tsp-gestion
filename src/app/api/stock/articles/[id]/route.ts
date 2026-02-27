import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Get article by ID
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

    const article = await db.article.findUnique({
      where: { id },
      include: {
        categorie: { select: { id: true, nom: true } },
        stocksZone: {
          include: {
            zone: { select: { id: true, nom: true, code: true } }
          }
        },
        mouvements: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            zone: { select: { id: true, nom: true } },
            user: { select: { id: true, nom: true, prenom: true } }
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 })
    }

    // Calculate total stock
    const stockTotal = article.stocksZone.reduce((sum, sz) => sum + sz.quantite, 0)

    return NextResponse.json({ ...article, stockTotal })
  } catch (error) {
    console.error("Error fetching article:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT - Update article
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
    const { code, nom, description, unite, seuilAlerte, categorieId } = body

    const updateData: Record<string, unknown> = {}
    if (code) updateData.code = code
    if (nom) updateData.nom = nom
    if (description !== undefined) updateData.description = description
    if (unite) updateData.unite = unite
    if (seuilAlerte !== undefined) updateData.seuilAlerte = seuilAlerte
    if (categorieId) updateData.categorieId = categorieId

    const article = await db.article.update({
      where: { id },
      data: updateData,
      include: {
        categorie: { select: { id: true, nom: true } }
      }
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error("Error updating article:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Delete article
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

    await db.article.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting article:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
