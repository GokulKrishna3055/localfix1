"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"
import {
  Users,
  Wrench,
  IndianRupee,
  TrendingUp,
  Shield,
  Settings,
  LogOut,
  Search,
  Filter,
} from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState("") // <-- Store admin name

  const stats = [
    { label: "Total Users", value: "12,450", change: "+8.2%", icon: Users, color: "text-blue-600" },
    { label: "Active Providers", value: "1,234", change: "+5.1%", icon: Wrench, color: "text-green-600" },
    { label: "Monthly Revenue", value: "₹45,230", change: "+12.3%", icon: IndianRupee, color: "text-purple-600" },
    { label: "Platform Growth", value: "23.5%", change: "+2.1%", icon: TrendingUp, color: "text-orange-600" },
  ]

  const recentActivity = [
    { type: "user", message: "New user registered: John Doe", time: "2 minutes ago", status: "success" },
    { type: "provider", message: "Provider verification: Mike's Plumbing", time: "15 minutes ago", status: "pending" },
    { type: "payment", message: "Payment processed: $150", time: "1 hour ago", status: "success" },
    { type: "report", message: "User report submitted", time: "2 hours ago", status: "warning" },
  ]

  // Fetch providers from backend
  const fetchProviders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/providers")
      setProviders(res.data.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching providers:", err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
    // Get admin name from localStorage
    const storedAdminName = localStorage.getItem("adminName")
    if (storedAdminName) setAdminName(storedAdminName)
  }, [])

  // Approve/Reject provider and remove from UI
  const handleAction = async (id, action) => {
    try {
      await axios.patch(`http://localhost:5000/admin/providers/${id}`, { action })
      setProviders((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      console.error(`Error ${action} provider:`, err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-purple-600">
                LocalFix
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">
                {adminName ? `Admin: ${adminName}` : "Administrator"} {/* Show name here */}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <Link href="/" className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                <LogOut className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage the LocalFix platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 shadow-lg transform hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}
                  >
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Verifications */}
            <div className="bg-white rounded-3xl p-6 shadow-lg transform hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Pending Verifications</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-500">Loading providers...</p>
                ) : providers.length === 0 ? (
                  <p className="text-gray-500">No pending providers</p>
                ) : (
                  providers.map((provider) => (
                    <div
                      key={provider._id}
                      className="group p-4 border border-gray-100 rounded-2xl hover:shadow-lg hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                            {provider.name} ({provider.businessName})
                          </h3>
                          <p className="text-sm text-gray-600">{provider.serviceCategory}</p>
                          <p className="text-xs text-gray-500">Location: {provider.location}</p>
                          <p className="text-xs text-gray-500">Email: {provider.email}</p>
                          <p className="text-xs text-gray-500">
                            Status: {provider.verificationStatus}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAction(provider._id, "approve")}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(provider._id, "reject")}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Management Tools */}
            <div className="bg-white rounded-3xl p-6 shadow-lg transform hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Management Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <button className="group bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <Users className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-800 mb-2">User Management</h3>
                  <p className="text-sm text-gray-600">Manage users and accounts</p>
                </button>
                <button className="group bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <Wrench className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-800 mb-2">Provider Oversight</h3>
                  <p className="text-sm text-gray-600">Monitor service providers</p>
                </button>
                <button className="group bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <Shield className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-800 mb-2">Security</h3>
                  <p className="text-sm text-gray-600">Platform security settings</p>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-6 shadow-lg transform hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    <span
                      className={`inline-block w-2 h-2 rounded-full mt-2 ${
                        activity.status === "success"
                          ? "bg-green-500"
                          : activity.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                    ></span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl p-6 text-white transform hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Server Status</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm">Online</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Database</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm">Healthy</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>API Response</span>
                  <span className="text-sm font-bold">45ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Uptime</span>
                  <span className="text-sm font-bold">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
