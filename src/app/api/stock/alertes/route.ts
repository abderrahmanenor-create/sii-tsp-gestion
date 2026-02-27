import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Get stock alerts (articles under threshold)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get all articles with their stock levels
    const articles = await db.article.findMany({
      include: {
        categorie: { select: { id: true, nom: true } },
        stocksZone: {
          include: {
            zone: { select: { id: true, nom: true, code: true } }
          }
        }
      }
    })

    // Filter articles under threshold
    const alertes = articles
      .map(article => {
        const stockTotal = article.stocksZone.reduce((sum, sz) => sum + sz.quantite, 0)
        return {
          ...article,
          stockTotal,
          sousSeuil: stockTotal < article.seuilAlerte
        }
      })
      .filter(article => article.sousSeuil)
      .map(article => ({
        id: article.id,
        code: article.code,
        nom: article.nom,
        unite: article.unite,
        seuilAlerte: article.seuilAlerte,
        stockTotal: article.stockTotal,
        categorie: article.categorie,
        stocksZone: article.stocksZone,
        deficit: article.seuilAlerte - article.stockTotal
      }))
      .sort((a, b) => b.deficit - a.deficit)

    return NextResponse.json(alertes)
  } catch (error) {
    console.error("Error fetching stock alerts:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
