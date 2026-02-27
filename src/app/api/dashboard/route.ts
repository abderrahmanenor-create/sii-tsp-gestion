import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Tâches en cours et terminées
    const [tachesEnCours, tachesTerminees] = await Promise.all([
      db.tache.count({ where: { statut: { in: ["A_FAIRE", "EN_COURS", "EN_ATTENTE"] } } }),
      db.tache.count({ where: { statut: "TERMINE" } })
    ])

    // Tâches par type
    const tachesParTypeRaw = await db.tache.groupBy({
      by: ["type"],
      _count: true
    })
    const tachesParType = tachesParTypeRaw.map(item => ({
      type: item.type,
      count: item._count
    }))

    // Pointages du jour
    const pointagesJour = await db.pointage.count({
      where: {
        date: { gte: today }
      }
    })

    // Pointages par zone
    const pointagesParZoneRaw = await db.pointage.groupBy({
      by: ["zoneId"],
      where: { date: { gte: today } },
      _count: true
    })
    const zones = await db.zone.findMany()
    const pointagesParZone = pointagesParZoneRaw.map(item => {
      const zone = zones.find(z => z.id === item.zoneId)
      return {
        zone: zone?.nom || zone?.code || "Inconnu",
        count: item._count
      }
    })

    // Alertes stock - articles sous seuil
    const articles = await db.article.findMany({
      include: {
        stocksZone: true,
        categorie: true
      }
    })
    
    const alertesStockList = articles
      .map(article => ({
        id: article.id,
        code: article.code,
        nom: article.nom,
        unite: article.unite,
        seuilAlerte: article.seuilAlerte,
        stockTotal: article.stocksZone.reduce((sum, sz) => sum + sz.quantite, 0)
      }))
      .filter(article => article.stockTotal < article.seuilAlerte)
      .slice(0, 5)

    const alertesStock = articles.filter(article => {
      const total = article.stocksZone.reduce((sum, sz) => sum + sz.quantite, 0)
      return total < article.seuilAlerte
    }).length

    // Tâches récentes
    const recentTaches = await db.tache.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        zone: { select: { id: true, nom: true, code: true } },
        assignee: { select: { id: true, nom: true, prenom: true, photo: true } }
      }
    })

    // Total utilisateurs
    const totalUsers = await db.user.count({ where: { actif: true } })

    return NextResponse.json({
      tachesEnCours,
      tachesTerminees,
      alertesStock,
      pointagesJour,
      totalUsers,
      tachesParType,
      pointagesParZone,
      recentTaches,
      alertesStockList
    })
  } catch (error) {
    console.error("Erreur dashboard:", error)
    return NextResponse.json(
      { error: "Erreur lors du chargement des données" },
      { status: 500 }
    )
  }
}
