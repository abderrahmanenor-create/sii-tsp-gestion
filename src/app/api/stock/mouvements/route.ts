import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TypeMouvement, Role } from "@prisma/client"

// GET - List mouvements
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get("articleId")
    const zoneId = searchParams.get("zoneId")
    const type = searchParams.get("type") as TypeMouvement | null

    const where: Record<string, unknown> = {}
    if (articleId) where.articleId = articleId
    if (zoneId) where.zoneId = zoneId
    if (type) where.type = type

    const mouvements = await db.mouvementStock.findMany({
      where,
      include: {
        article: { 
          select: { id: true, code: true, nom: true, unite: true } 
        },
        zone: { select: { id: true, nom: true, code: true } },
        user: { select: { id: true, nom: true, prenom: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    })

    return NextResponse.json(mouvements)
  } catch (error) {
    console.error("Error fetching mouvements:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create mouvement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { articleId, zoneId, type, quantite, motif, referenceDoc } = body

    if (!articleId || !zoneId || !type || quantite === undefined) {
      return NextResponse.json({ error: "Article, zone, type et quantité requis" }, { status: 400 })
    }

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Create mouvement
      const mouvement = await tx.mouvementStock.create({
        data: {
          articleId,
          zoneId,
          type: type as TypeMouvement,
          quantite,
          motif,
          referenceDoc,
          userId: session.user.id
        },
        include: {
          article: { select: { id: true, code: true, nom: true, unite: true } },
          zone: { select: { id: true, nom: true } },
          user: { select: { id: true, nom: true, prenom: true } }
        }
      })

      // Update stock
      let stockChange = quantite
      if (type === TypeMouvement.SORTIE || type === TypeMouvement.TRANSFERT_SORTIE) {
        stockChange = -quantite
      }

      // Find or create ArticleZone
      let articleZone = await tx.articleZone.findUnique({
        where: {
          articleId_zoneId: { articleId, zoneId }
        }
      })

      if (articleZone) {
        articleZone = await tx.articleZone.update({
          where: { id: articleZone.id },
          data: { quantite: { increment: stockChange } }
        })
      } else if (stockChange > 0) {
        articleZone = await tx.articleZone.create({
          data: {
            articleId,
            zoneId,
            quantite: stockChange
          }
        })
      }

      return mouvement
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating mouvement:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
