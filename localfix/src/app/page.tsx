"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight, MapPin, Zap, Shield, Star, Users, Clock } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const featuresRef = useRef<HTMLElement>(null)
  const [currentAdjectiveIndex, setCurrentAdjectiveIndex] = useState(0)
  const adjectives = ["Fast", "Reliable", "Trusted", "Professional", "Expert", "Quality", "Affordable", "Quick"]

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in")
        }
      })
    }, observerOptions)

    const cards = document.querySelectorAll(".feature-card")
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdjectiveIndex((prev) => (prev + 1) % adjectives.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [adjectives.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-orange-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-orange-600">LocalFix</div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-orange-600 transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-orange-600 transition-colors">
                About
              </Link>
              
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth" className="text-orange-600 hover:text-orange-700 font-medium">
                Sign In
              </Link>
              <Link
                href="/auth"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23F97316' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-shape absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float-slow" />
          <div className="floating-shape absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-float-medium" />
          <div className="floating-shape absolute bottom-20 left-1/4 w-16 h-16 bg-white/15 rounded-full blur-lg animate-float-fast" />
        </div>

        <div className="container mx-auto px-6 text-center text-white relative z-10">
          <div className="hero-content animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Local Help,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-red-300">
                <span
                  key={currentAdjectiveIndex}
                  className="inline-block animate-fade-in-scale font-extrabold"
                  style={{ minWidth: "280px", textAlign: "left" }}
                >
                  {adjectives[currentAdjectiveIndex]}
                </span>{" "}
                & Reliable
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto leading-relaxed">
              LocalFix connects you with trusted local service providers in minutes. Experience the future of local
              services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/needer/login"
                className="group bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-2"
              >
                Get Started as Service Needer
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/provider/login"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
              >
                Join as Provider
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Why Choose LocalFix?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of technology and local expertise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature Card 1 */}
            <div className="feature-card group cursor-pointer">
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-orange-600 transition-colors">
                    Local Matching
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get matched with nearby, high-rated providers instantly using our advanced location-based algorithm.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="feature-card group cursor-pointer">
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:-rotate-1 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-amber-600 transition-colors">
                    Lightning Fast
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive provider responses within minutes, not hours. Our real-time matching ensures quick
                    connections.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="feature-card group cursor-pointer">
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-rose-600 transition-colors">
                    Trusted & Secure
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    All providers are verified for safety and quality service. Your security is our top priority.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="stat-item">
              <div className="text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-2">
                <Users className="w-12 h-12" />
                10K+
              </div>
              <p className="text-xl text-orange-100">Happy Customers</p>
            </div>
            <div className="stat-item">
              <div className="text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-2">
                <Star className="w-12 h-12" />
                4.9
              </div>
              <p className="text-xl text-orange-100">Average Rating</p>
            </div>
            <div className="stat-item">
              <div className="text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-2">
                <Clock className="w-12 h-12" />
                2min
              </div>
              <p className="text-xl text-orange-100">Average Response</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section id="about" className="py-20 bg-gradient-to-br from-orange-50 to-pink-50 text-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Ready to find your perfect service provider?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of satisfied customers who found their local heroes through LocalFix
            </p>
            <Link
              href="/auth"
              className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-12 py-6 rounded-full font-bold text-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 mx-auto w-fit"
            >
              Join LocalFix Now
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">LocalFix</h3>
            <p className="text-gray-400 max-w-md mx-auto">Connecting communities through trusted local services</p>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">© 2025 LocalFix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
