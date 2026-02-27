import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

// POST - Validate pointage (chef projet, RH, admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || 
        (session.user.role !== Role.ADMIN && 
         session.user.role !== Role.CHEF_PROJET && 
         session.user.role !== Role.RH &&
         session.user.role !== Role.SUPERVISEUR)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params

    const pointage = await db.pointage.update({
      where: { id },
      data: {
        valide: true,
        valideParId: session.user.id
      },
      include: {
        user: { select: { id: true, nom: true, prenom: true } },
        zone: { select: { id: true, nom: true } }
      }
    })

    return NextResponse.json(pointage)
  } catch (error) {
    console.error("Error validating pointage:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
