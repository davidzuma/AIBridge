export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo or Brand */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text">MZ Asesoría</h1>
          <p className="text-gray-600 text-lg mt-2">Sistema de Consultas Fiscales y Laborales</p>
        </div>

        {/* Modern Loading Spinner */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-xl font-semibold text-gray-900">Cargando...</p>
          <p className="text-gray-600">Preparando tu experiencia profesional</p>
        </div>

        {/* Loading Progress Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Additional Loading States */}
        <div className="mt-12 space-y-3 max-w-md mx-auto">
          <div className="skeleton h-4 w-3/4 mx-auto"></div>
          <div className="skeleton h-4 w-1/2 mx-auto"></div>
          <div className="skeleton h-4 w-2/3 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}
