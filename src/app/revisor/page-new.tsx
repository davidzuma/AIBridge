"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Chat {
  id: string
  content: string
  response: string
  status: string
  reviewerComment?: string
  createdAt: string
  user: {
    name: string
    email: string
    isPremium?: boolean
  }
}

export default function RevisorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [reviewerComment, setReviewerComment] = useState("")
  const [newResponse, setNewResponse] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
    if (session?.user?.role !== "revisor") {
      router.push("/usuario")
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user) {
      fetchChats()
    }
  }, [session])

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/admin/chats")
      if (response.ok) {
        const data = await response.json()
        // Only show chats that require human review
        const reviewChats = data.filter((chat: Chat) => 
          chat.status === "revision_requerida" || 
          (chat.user.isPremium && chat.status === "ai_respondido")
        )
        setChats(reviewChats)
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  const updateChat = async (chatId: string, newStatus: string, customResponse?: string) => {
    setIsUpdating(true)
    try {
      const updateData: any = {
        chatId,
        status: newStatus,
        reviewerComment: reviewerComment.trim() || null,
      }

      if (customResponse) {
        updateData.response = customResponse
      }

      const response = await fetch("/api/admin/chats", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        await fetchChats()
        setSelectedChat(null)
        setReviewerComment("")
        setNewResponse("")
      }
    } catch (error) {
      console.error("Error updating chat:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      ai_respondido: "bg-blue-100 text-blue-800",
      validado: "bg-green-100 text-green-800",
      revision_requerida: "bg-orange-100 text-orange-800",
    }
    const labels = {
      ai_respondido: "Respuesta IA",
      validado: "Validado",
      revision_requerida: "Requiere Revisión",
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getStatusCounts = () => {
    return {
      ai_respondido: chats.filter(chat => chat.status === "ai_respondido").length,
      validado: chats.filter(chat => chat.status === "validado").length,
      revision_requerida: chats.filter(chat => chat.status === "revision_requerida").length,
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Revisor - Solo Usuarios Premium
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session?.user?.name} (Revisor)
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">{statusCounts.ai_respondido}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Respuestas IA Premium
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Para revisar
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">{statusCounts.revision_requerida}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Revisión Solicitada
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Urgente
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">{statusCounts.validado}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Validadas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Completadas
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⭐</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Solo Usuarios Premium
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Este panel muestra únicamente las consultas de usuarios Premium que requieren revisión humana. 
                Todas las demás consultas son respondidas automáticamente por IA.
              </p>
            </div>
          </div>
        </div>

        {/* Chats List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Consultas Premium para Revisar
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Consultas de usuarios Premium que necesitan revisión humana
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {chats.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">✅</span>
                  <p>No hay consultas premium pendientes de revisar</p>
                  <p className="text-xs mt-1">Todas las consultas normales son respondidas automáticamente por IA</p>
                </div>
              </li>
            ) : (
              chats.map((chat) => (
                <li key={chat.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {chat.user.name} ({chat.user.email})
                            </p>
                            {chat.user.isPremium && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                ⭐ Premium
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                            {chat.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(chat.createdAt).toLocaleString("es-ES")}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center space-x-3">
                          {getStatusBadge(chat.status)}
                          <button
                            onClick={() => {
                              setSelectedChat(chat)
                              setReviewerComment(chat.reviewerComment || "")
                              setNewResponse(chat.response)
                            }}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Revisar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Review Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Revisar Consulta Premium
                </h3>
                <div className="flex items-center space-x-2">
                  {selectedChat.user.isPremium && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      ⭐ Usuario Premium
                    </span>
                  )}
                  {getStatusBadge(selectedChat.status)}
                </div>
              </div>
              
              <div className="space-y-6">
                {/* User Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usuario:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedChat.user.name} ({selectedChat.user.email})
                  </p>
                </div>

                {/* User Query */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Consulta:
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                    {selectedChat.content}
                  </p>
                </div>

                {/* Current AI Response */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Respuesta actual de IA:
                  </label>
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="flex items-center mb-2">
                      <span className="text-blue-800 font-medium text-sm">🤖 Respuesta generada por IA</span>
                    </div>
                    <p className="text-sm text-blue-900">{selectedChat.response}</p>
                  </div>
                </div>

                {/* New Response (for editing) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Respuesta revisada (opcional - para sobrescribir la respuesta IA):
                  </label>
                  <textarea
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    placeholder="Deja en blanco para mantener la respuesta IA, o escribe una nueva respuesta..."
                  />
                </div>

                {/* Reviewer Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario del revisor (opcional):
                  </label>
                  <textarea
                    value={reviewerComment}
                    onChange={(e) => setReviewerComment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Agregar comentarios adicionales para el usuario..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => updateChat(
                    selectedChat.id, 
                    "validado", 
                    newResponse !== selectedChat.response ? newResponse : undefined
                  )}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isUpdating ? "Actualizando..." : "✓ Validar y Aprobar"}
                </button>
                <button
                  onClick={() => updateChat(selectedChat.id, "revision_requerida")}
                  disabled={isUpdating}
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isUpdating ? "Actualizando..." : "⚠ Marcar para Más Revisión"}
                </button>
                <button
                  onClick={() => {
                    setSelectedChat(null)
                    setReviewerComment("")
                    setNewResponse("")
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
