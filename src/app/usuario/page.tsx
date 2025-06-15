"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Chat {
  id: string
  content: string
  response: string
  sources?: string[]
  classification?: string
  status: string
  reviewerComment?: string
  createdAt: string
  files?: ChatFile[]
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

export default function UsuarioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [reviewLoading, setReviewLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [userPremium, setUserPremium] = useState(false)
  
  // New state for streaming
  const [streamingResponse, setStreamingResponse] = useState(false)
  const [currentResponse, setCurrentResponse] = useState("")
  const [currentSources, setCurrentSources] = useState<string[]>([])
  const [currentClassification, setCurrentClassification] = useState<{category: string, structuredQuestion: string} | null>(null)
  const [showClassification, setShowClassification] = useState(false)
  // const [currentChat, setCurrentChat] = useState<Chat | null>(null) // For future use

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
    // Removed automatic redirect for reviewers - they can access both dashboards
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

  // New streaming message function
  const sendStreamingMessage = async () => {
    if (!newMessage.trim()) return
    
    // Prevent duplicate calls while already loading
    if (isLoading) {
      console.log('Already loading, preventing duplicate call')
      return
    }

    console.log('Starting streaming message request:', newMessage)
    setIsLoading(true)
    setStreamingResponse(true)
    setCurrentResponse("")
    setCurrentSources([])
    setCurrentClassification(null)
    setShowClassification(false)

    try {
      const response = await fetch("/api/aeat-enhanced-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let buffer = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.type === 'classification') {
                  setCurrentClassification({
                    category: data.classification?.domain || 'General',
                    structuredQuestion: data.classification?.structuredQuestion || newMessage
                  })
                  setShowClassification(true)
                } else if (data.type === 'perplexity_start') {
                  // Perplexity search has started
                } else if (data.type === 'chunk') {
                  setCurrentResponse(prev => prev + data.content)
                } else if (data.type === 'complete') {
                  setCurrentResponse(data.fullResponse)
                  console.log('Received sources in frontend:', data.sources)
                  setCurrentSources(data.sources || [])
                  setStreamingResponse(false)
                  
                  // Save to chat history
                  await saveStreamingChat(newMessage, data.fullResponse, data.sources, data.classification)
                } else if (data.type === 'error') {
                  setCurrentResponse("Error: " + data.error)
                  setStreamingResponse(false)
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e)
              }
            }
          }
        }
      }

      setNewMessage("")
    } catch (error) {
      console.error("Error sending streaming message:", error)
      setCurrentResponse("Error processing the consultation. Please try again.")
      setStreamingResponse(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Save streaming chat to history
  const saveStreamingChat = async (question: string, response: string, sources: string[], classification?: {domain: string, structuredQuestion: string}) => {
    try {
      const chatResponse = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: question,
          response: response,
          sources: sources || [],
          classification: classification?.domain || null,
        }),
      })

      if (chatResponse.ok) {
        fetchChats() // Refresh chat list
      }
    } catch (error) {
      console.error("Error saving chat:", error)
    }
  }

  // Load chat response into main area
  const loadChatResponse = (chat: Chat) => {
    // setCurrentChat(chat) // For future use
    setCurrentResponse(chat.response)
    setCurrentSources(chat.sources || [])
    setCurrentClassification(chat.classification ? {
      category: chat.classification,
      structuredQuestion: chat.content
    } : null)
    setShowClassification(!!chat.classification)
  }

  // Request human review
  const requestHumanReview = async (chatId: string) => {
    setReviewLoading(chatId)
    try {
      const response = await fetch("/api/request-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      })

      if (response.ok) {
        fetchChats()
      }
    } catch (error) {
      console.error("Error requesting review:", error)
    } finally {
      setReviewLoading(null)
    }
  }

  // Small status badge for sidebar
  const getStatusBadgeSmall = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    
    switch (status) {
      case "pendiente":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Pendiente
          </span>
        )
      case "ai_responded":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            IA
          </span>
        )
      case "en_revision":
        return (
          <span className={`${baseClasses} bg-orange-100 text-orange-800`}>
            Revisión
          </span>
        )
      case "completado":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            ✓
          </span>
        )
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            -
          </span>
        )
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">No autorizado. Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    AIBridge Advisory
                  </h1>
                  {userPremium && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      PREMIUM
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Reviewer Navigation - show only for reviewers */}
              {session?.user?.role === "reviewer" && (
                <Link
                  href="/revisor"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reviewer Dashboard
                </Link>
              )}
              
              {/* Reviewer Registration - show only for regular users */}
              {session?.user?.role === "user" && (
                <Link
                  href="/reviewer-registration"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Become a Reviewer
                </Link>
              )}

              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">{session?.user?.name}</span>
                {session?.user?.role === "reviewer" && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full">
                    REVIEWER
                  </span>
                )}
              </div>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("chat")}
              className={`${
                activeTab === "chat"
                  ? "border-blue-500 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-sm rounded-t-lg transition-all flex items-center space-x-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Consultations</span>
            </button>
            {!userPremium && (
              <button
                onClick={() => setActiveTab("premium")}
                className={`${
                  activeTab === "premium"
                    ? "border-blue-500 text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50"
                    : "border-transparent text-blue-500 hover:text-blue-700 hover:border-blue-300"
                } whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-sm rounded-t-lg transition-all flex items-center space-x-2`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Get Premium</span>
              </button>
            )}
          </nav>
        </div>

        {/* Chat Tab with New Layout */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Main Consultation Area - Left Side (8 columns) */}
            <div className="col-span-8 flex flex-col">
              {/* New Consultation Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">New Consultation</h2>
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ask your question here..."
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={sendStreamingMessage}
                    disabled={isLoading || !newMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 h-fit"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Consulting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Submit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Response Area */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Specialized Answer</h3>
                  </div>
                  {streamingResponse && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Processing consultation...</span>
                    </div>
                  )}
                </div>

                {/* Classification Display */}
                {showClassification && currentClassification && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-blue-900 text-sm">Classification:</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            currentClassification.category === 'Fiscal' ? 'bg-green-100 text-green-800' :
                            currentClassification.category === 'Laboral' ? 'bg-blue-100 text-blue-800' :
                            currentClassification.category === 'Contable' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {currentClassification.category}
                          </span>
                        </div>
                        <p className="text-sm text-blue-800 font-medium mb-1">Structured question:</p>
                        <p className="text-sm text-blue-700 italic">&ldquo;{currentClassification.structuredQuestion}&rdquo;</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex-1 flex flex-col">
                  {/* Response Content */}
                  <div className="flex-1 mb-4">
                    {currentResponse ? (
                      <div className="h-full overflow-y-auto bg-gray-50 rounded-lg p-4">
                        <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-4">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mb-3">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-md font-semibold text-gray-900 mb-2">{children}</h3>,
                              p: ({ children }) => <p className="mb-3 text-gray-800">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="text-gray-800">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                              em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                              code: ({ children }) => <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-3">{children}</blockquote>,
                              a: ({ href, children }) => (
                                <a 
                                  href={href} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline"
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {currentResponse}
                          </ReactMarkdown>
                          {streamingResponse && (
                            <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Make your first consultation</h4>
                          <p className="text-gray-500">Las respuestas aparecerán aquí en tiempo real</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sources Section */}
                  {currentSources.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <h4 className="font-semibold text-gray-900 text-sm">Fuentes Oficiales</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {currentSources.map((source: string, index: number) => (
                          <a
                            key={index}
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group border border-blue-200"
                          >
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-blue-700 group-hover:text-blue-800 break-all leading-relaxed">{source}</span>
                              <div className="text-xs text-blue-500 mt-1">
                                {(() => {
                                  try {
                                    const url = new URL(source);
                                    return url.hostname;
                                  } catch {
                                    return 'Enlace externo';
                                  }
                                })()}
                              </div>
                            </div>
                            <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat History Sidebar - Right Side (4 columns) */}
            <div className="col-span-4 flex flex-col">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex-1 flex flex-col">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Consultation History</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3" style={{ scrollbarWidth: 'thin' }}>
                  {chats.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-500">No consultations yet</p>
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <div key={chat.id} className="bg-white border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-all cursor-pointer" onClick={() => loadChatResponse(chat)}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 pr-2">
                            <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{chat.content}</p>
                          </div>
                          {getStatusBadgeSmall(chat.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {new Date(chat.createdAt).toLocaleDateString("es-ES")}
                          </span>
                          {userPremium && chat.status === "ai_responded" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requestHumanReview(chat.id);
                              }}
                              disabled={reviewLoading === chat.id}
                              className="text-xs px-2 py-1 text-orange-600 hover:text-orange-700 font-medium"
                            >
                              {reviewLoading === chat.id ? "..." : "Revisar"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premium Tab */}
        {activeTab === "premium" && !userPremium && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Mejora tu experiencia
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Get Premium</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Accede a revisión profesional especializada y lleva tu asesoría fiscal al siguiente nivel
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Plan Gratuito</h3>
                  <p className="text-gray-600">Perfect for basic consultations</p>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Respuestas instantáneas con IA especializada</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Búsqueda en tiempo real en AEAT</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Complete consultation history</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
                  <p className="text-gray-600">Máximo nivel profesional</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Todo lo del plan gratuito</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-semibold">Revisión profesional especializada</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Soporte prioritario</span>
                  </li>
                </ul>
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold">
                  Get Premium
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
