"use client"
export const dynamic = "force-dynamic";

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Users, Wrench } from "lucide-react"

export default function AuthPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const roles = [
    {
      id: "needer",
      title: "Service Needer",
      description: "Find trusted local service providers for your needs",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      hoverColor: "from-blue-600 to-cyan-600",
      link: "/needer/login",
    },
    {
      id: "provider",
      title: "Service Provider",
      description: "Offer your services to local customers",
      icon: Wrench,
      color: "from-green-500 to-emerald-500",
      hoverColor: "from-green-600 to-emerald-600",
      link: "/provider/login",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23F97316' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Choose Your Role</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select how you'd like to use LocalFix to get started
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {roles.map((role) => {
            const IconComponent = role.icon
            return (
              <Link
                key={role.id}
                href={role.link}
                className="group relative"
                onMouseEnter={() => setSelectedRole(role.id)}
                onMouseLeave={() => setSelectedRole(null)}
              >
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-6 hover:rotate-1 border border-gray-100 overflow-hidden">
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${selectedRole === role.id ? role.hoverColor : role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Content */}
                  <div className="relative z-10 text-center">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${role.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}
                    >
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-300">
                      {role.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{role.description}</p>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-300 rounded-3xl transition-all duration-300" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-500">New to LocalFix? All roles require account verification for security.</p>
        </div>
      </div>
    </div>
  )
}
