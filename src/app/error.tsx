'use client'

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        {/* Error Icon */}
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <span className="text-4xl text-white">⚠️</span>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Algo Salió Mal
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y estamos trabajando para solucionarlo.
          </p>
          
          {/* Error Details (for development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <h3 className="font-semibold text-red-800 mb-2">Error Details (Development Mode):</h3>
              <p className="text-sm text-red-700 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={reset}
            className="btn-primary px-8 py-3 text-lg min-w-[200px]"
          >
            🔄 Intentar de Nuevo
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="btn-secondary px-8 py-3 text-lg min-w-[200px]"
          >
            🏠 Ir al Inicio
          </button>
        </div>

        {/* Support Information */}
        <div className="card-modern p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿El problema persiste?
          </h3>
          <p className="text-gray-600 mb-4">
            Si continúas experimentando problemas, contáctanos para recibir asistencia inmediata.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-blue-600">
              <span>📧</span>
              <span>soporte@mzasesoria.com</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <span>💬</span>
              <span>Chat en vivo disponible</span>
            </div>
          </div>
        </div>

        {/* Error Prevention Tips */}
        <div className="text-left space-y-3 bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Consejos para evitar errores:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Asegúrate de tener una conexión a internet estable</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Actualiza tu navegador a la versión más reciente</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Limpia la caché y cookies del navegador</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Desactiva temporalmente extensiones del navegador</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
