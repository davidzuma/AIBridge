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

export default function UsuarioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")

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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Gestoría Fiscal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hola, {session?.user?.name}
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
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "chat"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Chat de Consultas
            </button>
            <button
              onClick={() => setActiveTab("recursos")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "recursos"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Recursos
            </button>
          </nav>
        </div>

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* New Message */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Nueva Consulta
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
                    💡 <strong>¿Necesitas una respuesta rápida?</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Después de enviar tu consulta, podrás solicitar una respuesta instantánea de nuestra IA especializada en temas fiscales.
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
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900">Respuesta:</p>
                          {chat.status === "ai_respondido" && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center space-x-1">
                              <span>🤖</span>
                              <span>Respuesta IA</span>
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm mt-1">{chat.response}</p>
                        {chat.status === "ai_respondido" && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                            <p className="text-xs text-amber-800">
                              ⚠️ Esta es una respuesta generada por IA. Para consultas complejas o específicas, recomendamos que sea revisada por un profesional.
                            </p>
                          </div>
                        )}
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
