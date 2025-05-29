import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    nextauthUrl: process.env.NEXTAUTH_URL,
    nextauthSecret: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET", 
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV
  })
}
