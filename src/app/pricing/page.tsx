"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: "Gratuito",
      price: "0€",
      period: "siempre",
      description: "Perfecto para empezar con consultas básicas",
      features: [
        "3 consultas fiscales por mes",
        "Respuesta en 72 horas",
        "Acceso a recursos básicos",
        "Chat básico con revisor",
        "Soporte por email"
      ],
      limitations: [
        "Máximo 3 consultas mensuales",
        "No incluye asesoramiento personalizado",
        "Sin seguimiento de expedientes"
      ],
      buttonText: session ? "Plan Actual" : "Comenzar Gratis",
      buttonStyle: "border-2 border-gray-300 text-gray-700 hover:border-gray-400",
      popular: false
    },
    {
      name: "Profesional",
      price: isAnnual ? "25€" : "30€",
      originalPrice: isAnnual ? "30€" : null,
      period: isAnnual ? "mes (facturado anualmente)" : "mes",
      description: "Solución completa para autónomos y pequeñas empresas",
      features: [
        "Consultas fiscales ilimitadas",
        "Respuesta en 24 horas",
        "Asesoramiento personalizado",
        "Gestión de expedientes completa",
        "Chat directo con expertos fiscales",
        "Revisión de documentos",
        "Planificación fiscal anual",
        "Soporte prioritario",
        "Acceso a plantillas y formularios",
        "Recordatorios de obligaciones fiscales"
      ],
      buttonText: "Comenzar Prueba Gratuita",
      buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
      popular: true
    }
  ]

  const handlePlanSelection = (planName: string) => {
    if (!session) {
      router.push("/")
      return
    }

    if (planName === "Gratuito") {
      router.push("/usuario")
    } else {
      // Aquí iría la integración con Stripe o el procesador de pagos
      alert("Redirigiendo a la página de pago... (Por implementar)")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Planes y Precios
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades fiscales
          </p>
        </div>

        {/* Toggle Anual/Mensual */}
        <div className="mt-8 flex justify-center">
          <div className="bg-white p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-md transition-colors ${
                !isAnnual 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-md transition-colors ${
                isAnnual 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Anual
              <span className="ml-1 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Ahorra 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="mt-12 grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg ${
                plan.popular 
                  ? "ring-2 ring-blue-600 shadow-xl" 
                  : "border border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 text-sm font-medium rounded-full">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-center justify-center">
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through mr-2">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                  <p className="mt-3 text-gray-600">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    Incluye:
                  </h4>
                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations (solo para plan gratuito) */}
                {plan.limitations && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                      Limitaciones:
                    </h4>
                    <ul className="mt-4 space-y-2">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start">
                          <svg className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-gray-600 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <div className="mt-8">
                  <button
                    onClick={() => handlePlanSelection(plan.name)}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>

                {/* Trial Notice for Pro Plan */}
                {plan.name === "Profesional" && (
                  <p className="mt-3 text-sm text-gray-500 text-center">
                    Prueba gratuita de 14 días. Cancela cuando quieras.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-gray-600">
                Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplicarán en tu próximo período de facturación.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Qué incluye la prueba gratuita?
              </h3>
              <p className="text-gray-600">
                La prueba gratuita de 14 días incluye acceso completo a todas las funciones del plan Profesional, sin limitaciones.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Los precios incluyen IVA?
              </h3>
              <p className="text-gray-600">
                Los precios mostrados no incluyen IVA. El IVA se calculará según tu ubicación durante el proceso de pago.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Necesitas algo más personalizado?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Si tienes necesidades específicas o manejas un volumen alto de consultas, 
            contáctanos para crear un plan empresarial a medida.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Contactar Ventas
          </button>
        </div>
      </div>
    </div>
  )
}
