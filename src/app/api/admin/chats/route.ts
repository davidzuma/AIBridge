import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (session.user.role !== "reviewer") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const chats = await prisma.chat.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            isPremium: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get files for each chat using raw SQL and parse sources
    const chatsWithFiles = await Promise.all(
      chats.map(async (chat) => {
        const files = await prisma.$queryRaw<Array<{
          id: string;
          chatId: string;
          fileName: string;
          originalName: string;
          mimeType: string;
          size: number;
          filePath: string;
          createdAt: Date;
        }>>`
          SELECT * FROM "ChatFile" WHERE "chatId" = ${chat.id}
        `;
        
        // Parse sources JSON string back to array
        let parsedSources = [];
        if (chat.sources) {
          try {
            parsedSources = JSON.parse(chat.sources);
          } catch (error) {
            console.error('Error parsing sources JSON:', error);
            parsedSources = [];
          }
        }
        
        return {
          ...chat,
          sources: parsedSources,
          files
        };
      })
    );

    return NextResponse.json(chatsWithFiles)
  } catch (error) {
    console.error("Error fetching all chats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (session.user.role !== "reviewer") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { chatId, status, reviewerComment, response } = await request.json()

    if (!chatId || !status) {
      return NextResponse.json({ error: "Chat ID y status son requeridos" }, { status: 400 })
    }

    if (!["validated", "review_required"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    const updateData: { status: string; reviewerComment: string | null; response?: string } = {
      status,
      reviewerComment: reviewerComment || null,
    }

    // If a new response is provided, update it
    if (response && response.trim()) {
      updateData.response = response.trim()
    }

    const updatedChat = await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            isPremium: true,
          },
        },
      },
    })

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error("Error updating chat:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
