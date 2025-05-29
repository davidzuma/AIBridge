"use client"

import { signIn, useSession } from "next-auth/react"

export default function TestLogin() {
  const { data: session, status } = useSession()

  const handleGoogleLogin = async () => {
    console.log("Iniciando login con Google...")
    try {
      const result = await signIn("google", { 
        callbackUrl: "/",
        redirect: true 
      })
      console.log("Resultado del login:", result)
    } catch (error) {
      console.error("Error en login:", error)
    }
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-center text-green-600">¡Login exitoso!</h1>
          <div className="bg-green-100 p-4 rounded">
            <p><strong>Usuario:</strong> {session.user?.name}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>ID:</strong> {session.user?.id}</p>
            <p><strong>Rol:</strong> {session.user?.role}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Test de Autenticación</h1>
        
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold">Estado actual:</h3>
            <p>Status: {status}</p>
            <p>Sesión: {session ? "Activa" : "No activa"}</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    </div>
  )
}
