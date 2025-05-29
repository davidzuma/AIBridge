"use client"

import { useSession } from "next-auth/react"

export default function DebugPage() {
  const { data: session, status } = useSession()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Session</h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Status: {status}</h2>
        
        <h3 className="font-semibold mb-2">Session Data:</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
        
        <h3 className="font-semibold mb-2 mt-4">Environment Variables:</h3>
        <ul className="text-sm">
          <li>NEXTAUTH_URL: {process.env.NEXT_PUBLIC_NEXTAUTH_URL || "not set"}</li>
          <li>Google Client ID: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "configured" : "not configured"}</li>
        </ul>
      </div>
    </div>
  )
}
