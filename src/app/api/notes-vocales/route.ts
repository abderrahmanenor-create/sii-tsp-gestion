import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"
import ZAI from "z-ai-web-dev-sdk"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// GET - List notes vocales
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const where: Record<string, unknown> = {}
    
    // Agents can only see their own notes
    if (session.user.role === Role.AGENT) {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    const notes = await db.noteVocale.findMany({
      where,
      include: {
        user: { select: { id: true, nom: true, prenom: true, photo: true } },
        tache: { select: { id: true, titre: true, statut: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes vocales:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Upload audio and transcribe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const duree = parseInt(formData.get("duree") as string) || 0

    if (!audioFile) {
      return NextResponse.json({ error: "Fichier audio requis" }, { status: 400 })
    }

    // Save audio file
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "audio")
    await mkdir(uploadsDir, { recursive: true })
    
    const fileName = `${Date.now()}-${session.user.id}.webm`
    const filePath = path.join(uploadsDir, fileName)
    
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    await writeFile(filePath, audioBuffer)

    // Transcribe using ASR
    let transcription = ""
    try {
      const zai = await ZAI.create()
      
      // Convert audio to base64
      const base64Audio = audioBuffer.toString("base64")
      
      const asrResult = await zai.asr.create({
        audio: base64Audio,
        format: "webm"
      })
      
      transcription = asrResult.text || ""
    } catch (asrError) {
      console.error("ASR error:", asrError)
      // Continue without transcription if ASR fails
      transcription = "[Transcription non disponible]"
    }

    // Create note in database
    const note = await db.noteVocale.create({
      data: {
        audioUrl: `/uploads/audio/${fileName}`,
        transcription,
        duree,
        userId: session.user.id
      },
      include: {
        user: { select: { id: true, nom: true, prenom: true } }
      }
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("Error creating note vocale:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
