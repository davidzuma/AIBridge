import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      hasSession: !!session,
      user: session?.user ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      } : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error getting session:", error)
    return NextResponse.json({ 
      error: "Error getting session",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
