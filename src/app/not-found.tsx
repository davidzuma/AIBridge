'use client'

import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        {/* 404 Number with gradient */}
        <div className="space-y-4">
          <h1 className="text-9xl font-bold gradient-text tracking-tight">
            404
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-900">
            Página No Encontrada
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        {/* Illustration */}
        <div className="py-8">
          <div className="w-64 h-64 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-8 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-16 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">🔍</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => router.back()}
            className="btn-secondary px-8 py-3 text-lg min-w-[200px]"
          >
            ← Volver Atrás
          </button>
          <Link
            href="/"
            className="btn-primary px-8 py-3 text-lg min-w-[200px] text-center no-underline"
          >
            🏠 Ir al Inicio
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">¿Buscabas alguna de estas páginas?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/"
              className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              Inicio
            </Link>
            <Link
              href="/usuario"
              className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              Precios
            </Link>
          </div>
        </div>

        {/* Support Message */}
        <div className="card-modern p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Necesitas Ayuda?
          </h3>
          <p className="text-gray-600 mb-4">
            Si crees que esto es un error o necesitas asistencia, no dudes en contactarnos.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 text-blue-600">
              <span>📧</span>
              <span>soporte@mzasesoria.com</span>
            </div>
            <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
            <div className="flex items-center space-x-2 text-purple-600">
              <span>💬</span>
              <span>Chat en vivo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
