import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateReviewerSuggestion } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'revisor') {
      return NextResponse.json({ error: 'Acceso denegado - Solo revisores' }, { status: 403 })
    }

    const { chatId } = await request.json()

    if (!chatId) {
      return NextResponse.json({ 
        error: 'ID de chat es requerido' 
      }, { status: 400 })
    }

    // Get the chat details
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat no encontrado' }, { status: 404 })
    }

    // Generate suggestion for the reviewer
    const suggestion = await generateReviewerSuggestion(
      chat.content,
      `Usuario: ${chat.user.name} (${chat.user.email})`
    )

    return NextResponse.json({
      success: true,
      suggestion,
      chat: {
        id: chat.id,
        content: chat.content,
        currentResponse: chat.response,
        status: chat.status,
        user: chat.user
      }
    })

  } catch (error) {
    console.error('Error in reviewer suggestion API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
