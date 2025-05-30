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
}

// Removed unused User interface

export default function UsuarioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [reviewLoading, setReviewLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [userPremium, setUserPremium] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
    if (session?.user?.role === "revisor") {
      router.push("/revisor")
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user) {
      fetchChats()
      checkPremiumStatus()
    }
  }, [session])

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats")
      if (response.ok) {
        const data = await response.json()
        setChats(data)
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch("/api/user/premium-status")
      if (response.ok) {
        const data = await response.json()
        setUserPremium(data.isPremium)
      }
    } catch (error) {
      console.error("Error checking premium status:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        await fetchChats() // This will now show the AI response automatically
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const requestHumanReview = async (chatId: string) => {
    setReviewLoading(chatId)
    try {
      const response = await fetch("/api/request-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: chatId,
        }),
      })

      if (response.ok) {
        await fetchChats() // Refresh to show updated status
      } else {
        const error = await response.json()
        alert(error.error || "Error al solicitar revisión humana")
      }
    } catch (error) {
      console.error("Error requesting human review:", error)
      alert("Error al solicitar revisión humana")
    } finally {
      setReviewLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pendiente: "bg-yellow-100 text-yellow-800",
      ai_respondido: "bg-blue-100 text-blue-800",
      validado: "bg-green-100 text-green-800",
      revision_requerida: "bg-orange-100 text-orange-800",
    }
    const labels = {
      pendiente: "Pendiente",
      ai_respondido: "Respondido por IA",
      validado: "Validado por Revisor",
      revision_requerida: "En Revisión Humana",
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Gestoría Fiscal - MZ
              </h1>
              {userPremium && (
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-semibold rounded-full">
                  ⭐ PREMIUM
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session?.user?.name}</span>
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

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("chat")}
              className={`${
                activeTab === "chat"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Consultas
            </button>
            <button
              onClick={() => setActiveTab("recursos")}
              className={`${
                activeTab === "recursos"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Recursos
            </button>
            {!userPremium && (
              <button
                onClick={() => setActiveTab("premium")}
                className={`${
                  activeTab === "premium"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-yellow-500 hover:text-yellow-700 hover:border-yellow-300"
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                ⭐ Hazte Premium
              </button>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* New Chat Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Nueva Consulta Fiscal
              </h2>
              <div className="space-y-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu consulta fiscal aquí..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={4}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !newMessage.trim()}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Enviando..." : "Enviar Consulta"}
                </button>
                
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    🤖 <strong>Respuesta Instantánea con IA</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Todas las consultas son respondidas automáticamente por nuestra IA especializada en temas fiscales españoles.
                    {userPremium && " Como usuario Premium, también puedes solicitar revisión humana de cualquier respuesta."}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Historial de Consultas
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {chats.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No tienes consultas aún. ¡Haz tu primera pregunta!
                  </p>
                ) : (
                  chats.map((chat) => (
                    <div key={chat.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Tu consulta:</p>
                          <p className="text-gray-700 text-sm mt-1">{chat.content}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(chat.status)}
                          {userPremium && chat.status === "ai_respondido" && (
                            <button
                              onClick={() => requestHumanReview(chat.id)}
                              disabled={reviewLoading === chat.id}
                              className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-md hover:bg-orange-200 disabled:opacity-50 flex items-center space-x-1"
                            >
                              {reviewLoading === chat.id ? (
                                <>
                                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <span>Solicitando...</span>
                                </>
                              ) : (
                                <>
                                  <span>👤</span>
                                  <span>Revisión Humana</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900">Respuesta:</p>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center space-x-1">
                            <span>🤖</span>
                            <span>IA</span>
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mt-1">{chat.response}</p>
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-xs text-amber-800">
                            ⚠️ Esta respuesta ha sido generada por IA. 
                            {userPremium 
                              ? " Puedes solicitar una revisión humana si necesitas confirmación adicional."
                              : " Hazte Premium para acceder a revisión humana por profesionales."
                            }
                          </p>
                        </div>
                      </div>

                      {chat.reviewerComment && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="font-medium text-gray-900">Comentario del revisor:</p>
                          <p className="text-gray-700 text-sm mt-1">{chat.reviewerComment}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(chat.createdAt).toLocaleString("es-ES")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Premium Tab */}
        {activeTab === "premium" && !userPremium && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-8 border border-yellow-200">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ⭐ Hazte Premium
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Accede a revisión humana por profesionales fiscales
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Gratuito</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✅ Respuestas instantáneas con IA</li>
                    <li>✅ Historial de consultas</li>
                    <li>✅ Recursos fiscales básicos</li>
                    <li>❌ Revisión humana</li>
                    <li>❌ Soporte prioritario</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-6 shadow-md border-2 border-yellow-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Premium</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✅ Todo lo del plan gratuito</li>
                    <li>⭐ Revisión humana de respuestas IA</li>
                    <li>⭐ Consultas directas con profesionales</li>
                    <li>⭐ Soporte prioritario</li>
                    <li>⭐ Recursos fiscales avanzados</li>
                  </ul>
                  <div className="mt-6">
                    <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 px-6 rounded-md font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all">
                      Suscribirme - €29.99/mes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "recursos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Documentos Fiscales
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">
                    Guía de Deducciones 2024
                  </a>
                </li>
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">
                    Calendario Fiscal
                  </a>
                </li>
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">
                    Formularios Oficiales
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preguntas Frecuentes
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">
                    ¿Cómo declaro mis ingresos?
                  </a>
                </li>
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">
                    Deducciones permitidas
                  </a>
                </li>
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">
                    Plazos de presentación
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Calculadoras
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">
                    Calculadora de IRPF
                  </a>
                </li>
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">
                    Calculadora de IVA
                  </a>
                </li>
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">
                    Calculadora de Retenciones
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
