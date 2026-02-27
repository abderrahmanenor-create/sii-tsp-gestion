import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - List articles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categorieId = searchParams.get("categorieId")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}
    if (categorieId) where.categorieId = categorieId
    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } }
      ]
    }

    const articles = await db.article.findMany({
      where,
      include: {
        categorie: { select: { id: true, nom: true } },
        stocksZone: {
          include: {
            zone: { select: { id: true, nom: true, code: true } }
          }
        },
        _count: { select: { mouvements: true } }
      },
      orderBy: { nom: "asc" }
    })

    // Calculate total stock for each article
    const articlesWithTotal = articles.map(article => ({
      ...article,
      stockTotal: article.stocksZone.reduce((sum, sz) => sum + sz.quantite, 0)
    }))

    return NextResponse.json(articlesWithTotal)
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create article
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { code, nom, description, unite, seuilAlerte, categorieId } = body

    if (!code || !nom || !unite || !categorieId) {
      return NextResponse.json({ error: "Code, nom, unité et catégorie requis" }, { status: 400 })
    }

    // Check if code already exists
    const existingArticle = await db.article.findUnique({
      where: { code }
    })

    if (existingArticle) {
      return NextResponse.json({ error: "Un article avec ce code existe déjà" }, { status: 400 })
    }

    const article = await db.article.create({
      data: {
        code,
        nom,
        description,
        unite,
        seuilAlerte: seuilAlerte || 10,
        categorieId
      },
      include: {
        categorie: { select: { id: true, nom: true } }
      }
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
