import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { chatId } = await request.json()

    if (!chatId) {
      return NextResponse.json({ 
        error: 'ID de chat es requerido' 
      }, { status: 400 })
    }

    // Get user data to check premium status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.isPremium) {
      return NextResponse.json({ 
        error: 'Acceso premium requerido para revisión humana' 
      }, { status: 403 })
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

    // Update chat status to request human review
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        status: 'revision_requerida',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitud de revisión humana enviada',
      chat: updatedChat
    })

  } catch (error) {
    console.error('Error requesting human review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
