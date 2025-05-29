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
  }
}

export default function RevisorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [reviewerComment, setReviewerComment] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)

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
        setChats(data)
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  const updateChatStatus = async (chatId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/admin/chats", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          status: newStatus,
          reviewerComment: reviewerComment.trim() || null,
        }),
      })

      if (response.ok) {
        await fetchChats()
        setSelectedChat(null)
        setReviewerComment("")
        setAiSuggestion("")
      }
    } catch (error) {
      console.error("Error updating chat:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getAiSuggestion = async (chatId: string) => {
    setIsLoadingSuggestion(true)
    setAiSuggestion("")
    try {
      const response = await fetch("/api/ai/suggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestion(data.suggestion)
      } else {
        const error = await response.json()
        console.error("Error getting AI suggestion:", error)
        setAiSuggestion("Error al obtener sugerencia de IA")
      }
    } catch (error) {
      console.error("Error requesting AI suggestion:", error)
      setAiSuggestion("Error al obtener sugerencia de IA")
    } finally {
      setIsLoadingSuggestion(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pendiente: "bg-yellow-100 text-yellow-800",
      ai_respondido: "bg-blue-100 text-blue-800",
      validado: "bg-green-100 text-green-800",
      revision_requerida: "bg-red-100 text-red-800",
    }
    const labels = {
      pendiente: "Pendiente",
      ai_respondido: "IA Respondida",
      validado: "Validado",
      revision_requerida: "Revisión requerida",
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getStatusCounts = () => {
    return {
      pendiente: chats.filter(chat => chat.status === "pendiente").length,
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
                Panel de Revisor
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">{statusCounts.pendiente}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pendientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Sin revisar
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
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">{statusCounts.ai_respondido}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      IA Respondidas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Revisar IA
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

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">{statusCounts.revision_requerida}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Requieren Revisión
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Necesitan atención
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chats List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Todas las Consultas
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Lista de todas las consultas de los usuarios
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {chats.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">
                No hay consultas disponibles
              </li>
            ) : (
              chats.map((chat) => (
                <li key={chat.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {chat.user.name} ({chat.user.email})
                          </p>
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
                              setAiSuggestion("")
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
                  Revisar Consulta
                </h3>
                <button
                  onClick={() => getAiSuggestion(selectedChat.id)}
                  disabled={isLoadingSuggestion}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoadingSuggestion ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <span>🤖</span>
                      <span>Obtener Sugerencia IA</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Chat Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Usuario:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedChat.user.name} ({selectedChat.user.email})
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Consulta:
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                      {selectedChat.content}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Respuesta actual:
                    </label>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-900">{selectedChat.response}</p>
                      {selectedChat.status === "ai_respondido" && (
                        <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          🤖 Respuesta generada por IA
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentario del revisor (opcional):
                    </label>
                    <textarea
                      value={reviewerComment}
                      onChange={(e) => setReviewerComment(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      rows={4}
                      placeholder="Agregar comentarios adicionales..."
                    />
                  </div>
                </div>

                {/* Right Column - AI Suggestion */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sugerencia de IA:
                    </label>
                    {aiSuggestion ? (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                        <div className="flex items-center mb-2">
                          <span className="text-blue-800 font-medium text-sm">🤖 Análisis y Sugerencia</span>
                        </div>
                        <div className="text-sm text-blue-900 whitespace-pre-wrap">
                          {aiSuggestion}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-md text-center">
                        <p className="text-sm text-gray-500">
                          Haz clic en "Obtener Sugerencia IA" para recibir un análisis y sugerencia de respuesta para esta consulta.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado actual:
                    </label>
                    {getStatusBadge(selectedChat.status)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => updateChatStatus(selectedChat.id, "validado")}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isUpdating ? "Actualizando..." : "✓ Validar"}
                </button>
                <button
                  onClick={() => updateChatStatus(selectedChat.id, "revision_requerida")}
                  disabled={isUpdating}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isUpdating ? "Actualizando..." : "⚠ Requiere Revisión"}
                </button>
                <button
                  onClick={() => {
                    setSelectedChat(null)
                    setReviewerComment("")
                    setAiSuggestion("")
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
