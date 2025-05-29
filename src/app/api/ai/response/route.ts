import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateFiscalResponse } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { message, chatId } = await request.json()

    if (!message || !chatId) {
      return NextResponse.json({ 
        error: 'Mensaje y ID de chat son requeridos' 
      }, { status: 400 })
    }

    // Verify the chat belongs to the user
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id
      }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat no encontrado' }, { status: 404 })
    }

    // Generate AI response
    const aiResponse = await generateFiscalResponse(message)

    // Update the chat with AI response
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        response: aiResponse,
        status: 'ai_respondido', // New status for AI responses
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      response: aiResponse,
      chat: updatedChat
    })

  } catch (error) {
    console.error('Error in AI response API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
