import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { fileId } = await params

    // Get file information from database using raw SQL
    const chatFiles = await prisma.$queryRaw<Array<{
      id: string;
      chatId: string;
      fileName: string;
      originalName: string;
      mimeType: string;
      size: number;
      filePath: string;
      createdAt: Date;
      userId: string;
      userName: string;
      userEmail: string;
    }>>`
      SELECT cf.*, c."userId", u."name" as "userName", u."email" as "userEmail"
      FROM "ChatFile" cf
      JOIN "Chat" c ON cf."chatId" = c.id
      JOIN "User" u ON c."userId" = u.id
      WHERE cf.id = ${fileId}
    `;

    if (!chatFiles || chatFiles.length === 0) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    const chatFile = chatFiles[0];

    // Check if user has permission to access this file
    const canAccess = 
      chatFile.userId === session.user.id || // Owner
      session.user.role === "reviewer" // Reviewer

    if (!canAccess) {
      return NextResponse.json({ error: "No tienes permisos para acceder a este archivo" }, { status: 403 })
    }

    // Check if file exists on disk
    const filePath = join(process.cwd(), chatFile.filePath)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Archivo no encontrado en el servidor" }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(filePath)

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', chatFile.mimeType)
    headers.set('Content-Disposition', `attachment; filename="${chatFile.originalName}"`)
    headers.set('Content-Length', chatFile.size.toString())

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
