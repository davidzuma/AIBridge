"use client"

import { useEffect, useState } from "react"

interface Chat {
  id: string
  content: string
  response: string
  status: string
  reviewerComment?: string
  createdAt: string
  files?: ChatFile[]
  user: {
    name: string
    email: string
    isPremium?: boolean
  }
}

interface ChatFile {
  id: string
  fileName: string
  originalName: string
  mimeType: string
  size: number
  filePath: string
  createdAt: string
}

export default function TestFilesPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    console.log('fetchChats: Starting fetch request')
    try {
      const response = await fetch("/api/admin/chats")
      console.log('fetchChats: Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('fetchChats: Fetched chats data:', data)
        setChats(data)
      } else {
        const errorText = await response.text()
        console.error('fetchChats: Error response:', errorText)
        setError(`API Error: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error("fetchChats: Error fetching chats:", error)
      setError(`Network Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Files Page</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Chats Data ({chats.length} chats)</h2>
          
          {chats.length === 0 ? (
            <p className="text-gray-500">No chats found or loading...</p>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => (
                <div key={chat.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">Chat ID: {chat.id}</h3>
                    <span className="text-sm text-gray-500">{chat.status}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    User: {chat.user.name} ({chat.user.email}) - Premium: {chat.user.isPremium ? 'Yes' : 'No'}
                  </p>
                  
                  <p className="text-sm mb-3">
                    <strong>Content:</strong> {chat.content.substring(0, 100)}...
                  </p>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium">Files: {chat.files ? chat.files.length : 0}</p>
                    {chat.files && chat.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {chat.files.map((file) => (
                          <div key={file.id} className="text-xs text-gray-600">
                            • {file.originalName} ({file.size} bytes) - {file.mimeType}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
