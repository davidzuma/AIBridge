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
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect to get started with basic queries",
      features: [
        "3 tax queries per month",
        "Response within 72 hours",
        "Access to basic resources",
        "Basic chat with reviewer",
        "Email support"
      ],
      limitations: [
        "Maximum 3 monthly queries",
        "No personalized advice included",
        "No case tracking"
      ],
      buttonText: session ? "Current Plan" : "Start Free",
      buttonStyle: "border-2 border-gray-300 text-gray-700 hover:border-gray-400",
      popular: false
    },
    {
      name: "Professional",
      price: isAnnual ? "$25" : "$30",
      originalPrice: isAnnual ? "$30" : null,
      period: isAnnual ? "month (billed annually)" : "month",
      description: "Complete solution for freelancers and small businesses",
      features: [
        "Unlimited tax queries",
        "Response within 24 hours",
        "Personalized advice",
        "Complete case management",
        "Direct chat with tax experts",
        "Document review",
        "Annual tax planning",
        "Priority support",
        "Access to templates and forms",
        "Tax obligation reminders"
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
      popular: true
    }
  ]

  const handlePlanSelection = (planName: string) => {
    if (!session) {
      router.push("/")
      return
    }

    if (planName === "Free") {
      router.push("/usuario")
    } else {
      // Here would go the integration with Stripe or payment processor
      alert("Redirecting to payment page... (To be implemented)")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-modern py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Transparent pricing
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="gradient-text">Plans</span> that adapt
            <br />
            <span className="text-gray-700">to your business</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From basic queries to complete tax advisory. 
            Choose the perfect solution for your needs.
          </p>
        </div>

        {/* Toggle Anual/Mensual */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-gray-200 shadow-lg">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                !isAnnual 
                  ? "bg-blue-600 text-white shadow-md transform scale-105" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                isAnnual 
                  ? "bg-blue-600 text-white shadow-md transform scale-105" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span>Annual</span>
              <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative card-modern overflow-hidden ${
                plan.popular 
                  ? "ring-2 ring-blue-500 ring-offset-4 ring-offset-transparent scale-105 lg:scale-110" 
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full shadow-lg">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    plan.popular 
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
                      : "bg-gray-100"
                  }`}>
                    <svg className={`w-8 h-8 ${plan.popular ? "text-white" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        plan.popular 
                          ? "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          : "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      } />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center mb-3">
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through mr-3">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2 text-lg">/{plan.period.split(' ')[0]}</span>
                  </div>
                  {plan.period.includes('billed') && (
                    <p className="text-sm text-gray-500">{plan.period.split('month ')[1]}</p>
                  )}
                  <p className="text-gray-600 leading-relaxed">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Everything included
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start group">
                        <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations (solo para plan gratuito) */}
                {plan.limitations && (
                  <div className="mb-8">
                    <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-4 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      Limitations
                    </h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start">
                          <svg className="h-4 w-4 text-amber-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-gray-600 text-sm leading-relaxed">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <div className="space-y-4">
                  <button
                    onClick={() => handlePlanSelection(plan.name)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 hover:-translate-y-1 ${
                      plan.popular 
                        ? "btn-primary" 
                        : "btn-secondary"
                    }`}
                  >
                    {plan.buttonText}
                  </button>

                  {/* Trial Notice for Pro Plan */}
                  {plan.name === "Professional" && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>14-day free trial • Cancel anytime</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Frequently asked questions
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              <span className="gradient-text">Everything you</span>
              <br />
              need to know
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We answer the most common questions about our plans and services
            </p>
          </div>

          <div className="grid gap-6">
            {[
              {
                question: "Can I change my plan at any time?",
                answer: "Absolutely. You can upgrade or downgrade your plan whenever you need. If you upgrade, you'll have immediate access to new features. If you downgrade, changes will apply at the end of your current billing period so you make the most of what you've already paid for."
              },
              {
                question: "What does the Professional plan free trial include?",
                answer: "The 14-day free trial gives you complete access to all Professional plan features: unlimited queries, 24-hour response, personalized advice, direct chat with experts, and all advanced tools. There are no limitations or hidden features."
              },
              {
                question: "Do prices include VAT?",
                answer: "The prices shown are without VAT. The corresponding VAT will be automatically calculated based on your location during the payment process, complying with European tax regulations."
              },
              {
                question: "How does the 24-hour response work?",
                answer: "For Premium users, we guarantee that a tax expert will review and respond to your query within a maximum of 24 business hours. Urgent queries usually receive responses within hours, especially during business hours."
              },
              {
                question: "Can I cancel my subscription at any time?",
                answer: "Yes, you can cancel your subscription anytime from your user panel. There are no penalties or hidden fees. If you cancel, you'll maintain access to Premium features until the end of your billing period."
              },
              {
                question: "What types of tax queries can I make?",
                answer: "We cover all tax areas: personal income tax, VAT, corporate tax, self-employed, tax planning, filing obligations, inspections, appeals, and much more. Our experts specialize in tax law and will help you with any tax questions."
              }
            ].map((faq, index) => (
              <div key={index} className="card-modern group hover:scale-102 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-12 text-center">
            <div className="card-modern bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/50">
              <div className="p-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Have more questions?
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Our team is here to help you. Send us a message and we&apos;ll get back to you as soon as possible.
                </p>
                <button className="btn-primary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-20">
          <div className="card-modern bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border-2 border-indigo-200/50">
            <div className="p-8 lg:p-12 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                <span className="gradient-text">Need something</span>
                <br />
                more personalized?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                If you handle a high volume of queries, have specific needs, or represent a company, 
                we create enterprise plans completely adapted to your requirements.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Custom pricing</h3>
                  <p className="text-sm text-gray-600">Adapted to your volume and specific needs</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Dedicated manager</h3>
                  <p className="text-sm text-gray-600">A tax expert assigned to your company</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Guaranteed SLA</h3>
                  <p className="text-sm text-gray-600">Assured response times and availability</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Sales
                </button>
                <button className="btn-secondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Request Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
