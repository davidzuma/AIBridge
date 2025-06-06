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
      const updateData: { chatId: string; status: string; reviewerComment: string | null; response?: string } = {
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
    const statusMap = {
      ai_respondido: "status-pending",
      validado: "status-approved", 
      revision_requerida: "status-revision",
    }
    const labels = {
      ai_respondido: "Respuesta IA",
      validado: "Validado",
      revision_requerida: "Requiere Revisión",
    }
    
    return (
      <span className={`status-badge ${statusMap[status as keyof typeof statusMap]}`}>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando panel de revisor...</p>
        </div>
      </div>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Panel de Revisor
                </h1>
                <p className="text-sm text-gray-600">Gestión de usuarios Premium</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || 'R'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">Revisor Profesional</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="btn-secondary text-sm"
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
          <div className="card-modern group hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="feature-icon bg-gradient-to-r from-blue-500 to-blue-600">
                    <span className="text-white font-bold text-lg">{statusCounts.ai_respondido}</span>
                  </div>
                </div>
                <div className="ml-5 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Respuestas IA Premium
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Pendientes de revisión profesional
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-modern group hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="feature-icon bg-gradient-to-r from-orange-500 to-orange-600">
                    <span className="text-white font-bold text-lg">{statusCounts.revision_requerida}</span>
                  </div>
                </div>
                <div className="ml-5 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    Revisión Solicitada
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Casos que requieren atención urgente
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-modern group hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="feature-icon bg-gradient-to-r from-green-500 to-green-600">
                    <span className="text-white font-bold text-lg">{statusCounts.validado}</span>
                  </div>
                </div>
                <div className="ml-5 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    Validadas
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Consultas completadas exitosamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="card-modern bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/50 mb-8">
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900">
                  Panel Exclusivo de Usuarios Premium
                </h3>
                <p className="mt-2 text-blue-700 leading-relaxed">
                  Este panel está diseñado específicamente para la revisión profesional de consultas de usuarios Premium. 
                  Todas las consultas estándar son procesadas automáticamente por nuestro sistema de IA, mientras que 
                  las consultas Premium reciben atención personalizada de nuestro equipo de expertos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chats List */}
        <div className="card-modern">
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Consultas Premium para Revisar
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Consultas de usuarios Premium que requieren revisión profesional personalizada
                </p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {chats.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    ¡Todo al día!
                  </h4>
                  <p className="text-gray-600 max-w-md">
                    No hay consultas premium pendientes de revisar en este momento.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Las consultas estándar son procesadas automáticamente por IA
                  </p>
                </div>
              </div>
            ) : (
              chats.map((chat) => (
                <div key={chat.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {chat.user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-base font-semibold text-gray-900">
                              {chat.user.name}
                            </h4>
                            <span className="status-badge status-premium">
                              Premium
                            </span>
                            {getStatusBadge(chat.status)}
                          </div>
                          <p className="text-sm text-gray-600">{chat.user.email}</p>
                        </div>
                      </div>
                      <div className="ml-13">
                        <p className="text-gray-800 line-clamp-3 leading-relaxed mb-2">
                          {chat.content}
                        </p>
                        <p className="text-xs text-gray-500">
                          📅 {new Date(chat.createdAt).toLocaleString("es-ES")}
                        </p>
                      </div>
                    </div>
                    <div className="ml-6 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedChat(chat)
                          setReviewerComment(chat.reviewerComment || "")
                          setNewResponse(chat.response)
                        }}
                        className="btn-primary"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Revisar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
          <div className="card-modern w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Revisar Consulta Premium
                    </h3>
                    <p className="text-sm text-gray-600">Revisión profesional personalizada</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="status-badge status-premium">
                    Usuario Premium
                  </span>
                  {getStatusBadge(selectedChat.status)}
                </div>
              </div>
              
              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {selectedChat.user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedChat.user.name}</h4>
                      <p className="text-sm text-gray-600">{selectedChat.user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        📅 {new Date(selectedChat.createdAt).toLocaleString("es-ES")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Query */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    📝 Consulta del Usuario
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-800 leading-relaxed">
                      {selectedChat.content}
                    </p>
                  </div>
                </div>

                {/* Current AI Response */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    🤖 Respuesta Actual de IA
                  </label>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-blue-800 font-medium text-sm">Respuesta generada por IA</span>
                    </div>
                    <p className="text-blue-900 leading-relaxed">{selectedChat.response}</p>
                  </div>
                </div>

                {/* New Response (for editing) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    ✏️ Respuesta Revisada (Opcional)
                  </label>
                  <textarea
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    className="modern-input"
                    rows={4}
                    placeholder="Deja en blanco para mantener la respuesta IA, o escribe una nueva respuesta profesional..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Si modificas la respuesta, esta reemplazará completamente la respuesta de IA
                  </p>
                </div>

                {/* Reviewer Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    💬 Comentario del Revisor (Opcional)
                  </label>
                  <textarea
                    value={reviewerComment}
                    onChange={(e) => setReviewerComment(e.target.value)}
                    className="modern-input"
                    rows={3}
                    placeholder="Agregar comentarios adicionales, aclaraciones o notas para el usuario..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => updateChat(
                    selectedChat.id, 
                    "validado", 
                    newResponse !== selectedChat.response ? newResponse : undefined
                  )}
                  disabled={isUpdating}
                  className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {isUpdating ? "Procesando..." : "Validar y Aprobar"}
                </button>
                <button
                  onClick={() => updateChat(selectedChat.id, "revision_requerida")}
                  disabled={isUpdating}
                  className="btn-secondary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {isUpdating ? "Procesando..." : "Marcar para Más Revisión"}
                </button>
                <button
                  onClick={() => {
                    setSelectedChat(null)
                    setReviewerComment("")
                    setNewResponse("")
                  }}
                  className="btn-secondary flex-1 justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
