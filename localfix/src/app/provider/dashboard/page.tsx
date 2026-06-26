"use client"
export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { 
  Bell, Calendar, IndianRupee, Star, TrendingUp, User, Settings, LogOut, MapPin, Clock 
} from "lucide-react"

interface Problem {
  _id: string
  title: string
  description: string
  status: string
  location?: string
  createdAt: string
}

interface Provider {
  _id: string
  name: string
  verificationStatus: string
  phone?: string
}

export default function ProviderDashboard() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pickedProblems, setPickedProblems] = useState<Problem[]>([])

  useEffect(() => {
  if (!provider) return

  const fetchPicked = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/picked-problems/provider/${provider._id}`
      )
      if (!res.ok) throw new Error("Failed to fetch picked problems")

      const data: Problem[] = await res.json()
      setPickedProblems(data)
    } catch (err: any) {
      console.error("Failed to fetch picked problems", err)
    }
  }

  fetchPicked()
}, [provider])
  // Fetch provider info
  useEffect(() => {
    const checkProvider = async () => {
      const loggedInProvider = localStorage.getItem("provider")
      if (!loggedInProvider) {
        window.location.href = "/provider/login"
        return
      }

      try {
        const { _id } = JSON.parse(loggedInProvider)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/providers/${_id}`)
        if (!res.ok) throw new Error("Failed to fetch provider info")

        const data = await res.json()
        if (!data.success) throw new Error("Failed to fetch provider info")

        setProvider(data.provider)
        localStorage.setItem("provider", JSON.stringify(data.provider))
      } catch (err) {
        console.error("Failed to fetch provider info", err)
        setError("Failed to load provider info. Please refresh the page.")
      }
    }

    checkProvider()
  }, [])

  // Fetch problems
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/problems`)
        if (!res.ok) throw new Error("Failed to fetch problems")
        const data: Problem[] = await res.json()
        setProblems(data)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchProblems()
  }, [])

  // Memoized stats
  const activeJobs = useMemo(() => problems.filter(p => p.status === "In Progress").length, [problems])
  const completedJobs = useMemo(() => problems.filter(p => p.status === "Completed").length, [problems])

  const stats = [
    { label: "Total Earnings", value: "₹2,450", change: "+12%", icon: IndianRupee, color: "text-green-600" },
    { label: "Active Jobs", value: activeJobs, change: "+2", icon: Calendar, color: "text-blue-600" },
    { label: "Rating", value: "4.9", change: "+0.1", icon: Star, color: "text-yellow-600" },
    { label: "Completed", value: completedJobs, change: "+8", icon: TrendingUp, color: "text-purple-600" },
  ]

  const handlePick = async (problemId: string) => {
    if (!provider) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/problems/${problemId}/pick`, {
  method: "POST", // <-- must match backend
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    providerId: provider._id,
    providerContact: provider.name + (provider.phone ? " (" + provider.phone + ")" : "")
  })
})

      const data = await res.json()
      if (data.success) {
        // ✅ Remove problem from UI silently (no alert)
        setProblems(prev => prev.filter(pr => pr._id !== problemId))
      } else {
        console.error("Pick failed:", data.message)
      }
    } catch (err) {
      console.error("❌ Failed to pick problem", err)
    }
  }

  const toggleStatus = async (problem: Problem) => {
  if (!provider) return

  try {
    const newStatus = problem.status === "Completed" ? "In Progress" : "Completed"

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/picked-problems/${problem._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })

    const data = await res.json()
    if (data.success) {
      // Update local state
      setPickedProblems(prev => prev.map(p => p._id === problem._id ? { ...p, status: newStatus } : p))
      // Also update problems list if it's in UI
      setProblems(prev => prev.map(p => p._id === problem._id ? { ...p, status: newStatus } : p))
    } else {
      console.error("Failed to update status:", data.message)
    }
  } catch (err) {
    console.error("Error updating status:", err)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-green-600">LocalFix</Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Service Provider</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <Settings className="w-5 h-5 text-gray-600 hover:text-green-600 cursor-pointer" />
            <User className="w-5 h-5 text-gray-600 hover:text-green-600 cursor-pointer" />
            <Link
              href="/provider/login"
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              onClick={() => localStorage.removeItem("provider")}
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Rejected Banner */}
        {provider?.verificationStatus === "rejected" && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            Your account was rejected by admin. You cannot take new actions.
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {provider?.name || "Provider"}!
          </h1>
          <p className="text-gray-600">Manage your services and grow your business</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-3xl p-6 shadow-lg hover:-translate-y-1 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Recent Problems */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Problems</h2>
            <button className="text-green-600 hover:text-green-700 font-medium">View All</button>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading problems...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : problems.length === 0 ? (
            <p className="text-gray-500">No problems submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {problems.map((p) => (
                <div
                  key={p._id}
                  className="p-4 border border-gray-100 rounded-2xl hover:shadow-lg hover:border-green-200 transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{p.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : p.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {p.status || "Pending"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{p.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{p.location || "Unknown"}</div>
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{new Date(p.createdAt).toLocaleString()}</div>
                  </div>

                  {/* Pick & Contact Button */}
                  {p.status === "Pending" && provider?.verificationStatus !== "rejected" && (
                    <button
                      onClick={() => handlePick(p._id)}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Pick & Contact Needer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Picked Problems by You */}
<div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-gray-800">Picked Problems by You</h2>
    <button className="text-green-600 hover:text-green-700 font-medium">View All</button>
  </div>

  {pickedProblems.length === 0 ? (
    <p className="text-gray-500">You haven't picked any problems yet.</p>
  ) : (
    <div className="space-y-4">
      {pickedProblems.map((p) => (
        <div
          key={p._id}
          className="p-4 border border-gray-100 rounded-2xl hover:shadow-lg hover:border-green-200 transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">{p.title}</h3>
            
            {/* ✅ Status button */}
            <button
              onClick={() => toggleStatus(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                p.status === "Completed"
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : p.status === "In Progress"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {p.status || "Pending"}
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-2">{p.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{p.location || "Unknown"}</div>
            <div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{new Date(p.createdAt).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>


    </div>
  )
}
