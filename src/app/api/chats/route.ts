import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateFiscalResponse } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { content, response, sources = [], classification, files = [] } = await request.json()

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "El contenido es requerido" }, { status: 400 })
    }

    // If response is provided (from streaming), use it; otherwise generate AI response
    let finalResponse = response
    if (!finalResponse) {
      finalResponse = await generateFiscalResponse(content.trim())
    }

    const chat = await prisma.chat.create({
      data: {
        userId: session.user.id,
        content: content.trim(),
        response: finalResponse,
        ...(sources && { sources }),
        ...(classification && { classification }),
        status: "ai_respondido",
      },
    })

    // Save file information if files were uploaded
    if (files.length > 0) {
      for (const file of files) {
        await prisma.$executeRaw`
          INSERT INTO "ChatFile" ("id", "chatId", "fileName", "originalName", "mimeType", "size", "filePath", "createdAt")
          VALUES (gen_random_uuid(), ${chat.id}, ${file.fileName}, ${file.originalName}, ${file.mimeType}, ${file.size}, ${file.filePath}, NOW())
        `;
      }
    }

    // Return chat with files included
    const chatFiles = await prisma.$queryRaw`
      SELECT * FROM "ChatFile" WHERE "chatId" = ${chat.id}
    `;
    
    const chatWithFiles = {
      ...chat,
      files: chatFiles
    };

    return NextResponse.json(chatWithFiles)
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const chats = await prisma.chat.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get files for each chat
    const chatsWithFiles = await Promise.all(
      chats.map(async (chat) => {
        const files = await prisma.$queryRaw`
          SELECT * FROM "ChatFile" WHERE "chatId" = ${chat.id}
        `;
        return {
          ...chat,
          files
        };
      })
    );

    return NextResponse.json(chatsWithFiles)
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
