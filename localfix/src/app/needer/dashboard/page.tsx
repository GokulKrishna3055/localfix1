"use client"
export const dynamic = "force-dynamic";

import type React from "react"
import { useState, useEffect } from "react"
import { useRef } from "react";
import Link from "next/link"
import { Search, MapPin, Star, Plus, User, Settings, LogOut, X, Camera, Zap } from "lucide-react"
import { createProblem } from "./../../utils/api.js"
import { io } from "socket.io-client"
import nextDynamic from "next/dynamic"

const MapContainer = nextDynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false }) as React.ComponentType<any>
const TileLayer = nextDynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false }) as React.ComponentType<any>
const Marker = nextDynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false }) as React.ComponentType<any>
const Popup = nextDynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false }) as React.ComponentType<any>


export default function NeederDashboard({neederId}: {neederId: string}) {
  const socketRef = useRef<any>(null);

useEffect(() => {
  socketRef.current = io(process.env.NEXT_PUBLIC_API_URL!);

  return () => socketRef.current?.disconnect();
}, []);

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [serviceForm, setServiceForm] = useState({ title: "", description: "", category: "", urgency: "normal", budget: "", location: "" })
  const [userName, setUserName] = useState("User")
  const [recentProblems, setRecentProblems] = useState<any[]>([])
  const [userLocation, setUserLocation] = useState<[number, number]>([13.0827, 80.2707]) // Default Chennai
  const [nearbyProviders, setNearbyProviders] = useState<any[]>([])
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [neederId1, setNeederId] = useState<string>("")
  // Categories
  const categories = ["All Services","Plumbing","Electrical","Cleaning","Gardening","Painting","Carpentry","HVAC","Appliance Repair","Moving"]

  // Initialize Leaflet
  useEffect(() => {
    const L = require("leaflet")
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    })
    setLeafletLoaded(true)
  }, [])

  // Fetch needer info and recent problems
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUserName(parsed.username || parsed.name || "User")

        if (parsed.email) {
          fetchUserIdByEmail(parsed.email)
        }
      } catch (err) {
        console.error("Failed to parse needer info:", err)
      }
    }
  }, [])
  const fetchUserIdByEmail = async (email: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/by-email/${email}`)
      const data = await res.json()
      if (data.success && data.user?._id) {
        setNeederId(data.user._id)
        fetchNeederProblems(data.user._id)
      }
    } catch (err) {
      console.error("Failed to fetch userId:", err)
    }
  }

  // Fetch recent problems
  const fetchNeederProblems = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/problems/${id}`)
      const data = await res.json()
      if (data.success) {
        setRecentProblems(data.problems)
      }
    } catch (err) {
      console.error("Failed to fetch problems:", err)
    }
  }

  // Get user location and fetch nearby providers
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setUserLocation([lat, lon])
        fetchNearbyProviders(lat, lon)
      },
      () => {
        fetchNearbyProviders(userLocation[0], userLocation[1])
      }
    )
  }, [])

  // Fetch nearby providers (dummy for now, replace with API if needed)
  const fetchNearbyProviders = async (lat: number, lon: number) => {
    // Static nearby providers for demonstration
    setNearbyProviders([
      { id: 1, name: "John's Electrical", category: "Electrical", rating: 4.8, reviews: 124, lat: lat + 0.002, lon: lon + 0.002, price: "₹50-80/hr" },
      { id: 2, name: "Fresh Clean Co", category: "Cleaning", rating: 4.9, reviews: 89, lat: lat - 0.0015, lon: lon - 0.0015, price: "₹30-50/hr" },
    ])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setUploadedImage(file)
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!neederId1) {
    alert("User ID not found. Please re-login.");
    return;
      }

      const payload = {
        ...serviceForm,
        imageUrl: uploadedImage ? URL.createObjectURL(uploadedImage) : null,
        neederId: neederId1,   // ✅ send the logged-in neederId
      };
      const user = JSON.parse(localStorage.getItem("needer") || "{}")
      //const problemData = { ...serviceForm, urgency: "normal", imageUrl: uploadedImage?.name || null, neederId: user._id }
      await createProblem(payload)
      alert("✅ Service request submitted!")
      setShowServiceModal(false)
      setServiceForm({ title: "", description: "", category: "", urgency: "normal", budget: "", location: "" })
      setUploadedImage(null)
      fetchNeederProblems(user._id)
    } catch (err) {
      console.error(err)
      alert("❌ Failed to submit request")
    }
  }

  const handleEmergencyServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = JSON.parse(localStorage.getItem("needer") || "{}")
      const problemData = { ...serviceForm, urgency: "emergency", imageUrl: uploadedImage?.name || null, neederId: user._id }
      await createProblem(problemData)
      alert("🚨 Emergency request submitted!")
      setShowEmergencyModal(false)
      setServiceForm({ title: "", description: "", category: "", urgency: "normal", budget: "", location: "" })
      setUploadedImage(null)
      fetchNeederProblems(user._id)
    } catch (err) {
      console.error(err)
      alert("❌ Failed to submit emergency request")
    }
  }

  const handleAIAssist = () => {
    if (uploadedImage) window.open("https://localfix-bm69dgvxmn5h6ttbamtc95.streamlit.app/", "_blank")
    else alert("Please upload an image first for AI analysis")
  }

  if (!leafletLoaded) return null

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
       {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                LocalFix
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Service Needer</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">{userName}</span>
              </div>
              <Link href="/" className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                <LogOut className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts
      <h1 className="px-6 py-4 text-lg font-semibold">Alerts</h1>
      <ul className="px-6">
        {alerts.map((msg, i) => <li key={i} className="mb-1 text-sm text-gray-700">{msg}</li>)}
      </ul> */}

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {userName}!</h1>
          <p className="text-gray-600">Find the perfect service provider for your needs</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-8 transform hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What service do you need?"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              {categories.map((category, index) => (
                <option key={index} value={category.toLowerCase().replace(/\s+/g, "-")}>
                  {category}
                </option>
              ))}
            </select>
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
              <Search className="w-5 h-5" /> Search
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-lg transform hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button onClick={() => setShowServiceModal(true)} className="group bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <Plus className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-800 mb-2">New Service Request</h3>
                  <p className="text-sm text-gray-600">Post a new service request</p>
                </button>
                <button onClick={() => setShowEmergencyModal(true)} className="group bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <Zap className="w-8 h-8 text-red-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-800 mb-2">Emergency Service</h3>
                  <p className="text-sm text-gray-600">Get immediate help</p>
                </button>
              </div>
            </div>

         {/* Map */}
        <div className="bg-white rounded-3xl p-6 shadow-lg h-[500px]">
          <h2 className="text-xl font-bold mb-4">Nearby Providers</h2>
          <div className="w-full h-[400px] rounded-xl overflow-hidden">
            <MapContainer
              center={userLocation}
              zoom={15}
              className="w-full h-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {nearbyProviders.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lon]}>
                  <Popup>
                    <strong>{p.name}</strong><br />
                    {p.category}<br />
                    Rating: {p.rating} ({p.reviews})<br />
                    Price: {p.price}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Requests */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Requests</h2>
            {recentProblems.length === 0 ? <p className="text-gray-500">No recent requests.</p> : recentProblems.map(p => (
              <div key={p._id} className="p-4 border border-gray-100 rounded-2xl mb-2">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm">Provider: {p.pickedBy?.name || p.pickedBy || "Pending"}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === "Completed" ? "bg-green-100 text-green-800" : p.status === "In Progress" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>{p.status || "Pending"}</span>
                {p.status === "In Progress" && p.pickedBy && (
                  <p className="text-green-600">Picked by: {p.pickedBy.name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 text-white transform hover:shadow-xl transition-all duration-300" style={{height:"200px"}}>
              <h2 className="text-xl font-bold mb-4">Your Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between"> <span>Total Requests</span> <span className="font-bold">{recentProblems.length}</span> </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span className="font-bold">{recentProblems.filter(p => p.status === "Completed").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Rating</span>
                  <span className="font-bold">{(recentProblems.reduce((acc, p) => acc + (p.rating || 0), 0) / (recentProblems.length || 1)).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        
          
        
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">New Service Request</h2>
              <button onClick={() => setShowServiceModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors" >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleServiceSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
                <input type="text" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Fix leaky kitchen faucet" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" required >
                  <option value="">Select a category</option>
                  {categories.slice(1).map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none" placeholder="Describe the problem or service needed..." required />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <select value={serviceForm.budget} onChange={(e) => setServiceForm({ ...serviceForm, budget: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" >
                    <option value="">Select budget</option>
                    <option value="under-50">Under ₹50</option>
                    <option value="50-100">₹50 - ₹100</option>
                    <option value="100-250">₹100 - ₹250</option>
                    <option value="250-500">₹250 - ₹500</option>
                    <option value="500-plus">₹500+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input type="text" value={serviceForm.location} onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your address or area" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Problem Image (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload an image of the problem</p>
                    {uploadedImage && <p className="text-blue-600 mt-2 font-medium">{uploadedImage.name}</p>}
                  </label>
                </div>
              </div>
              {uploadedImage && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">AI Problem Analysis</h3>
                      <p className="text-sm text-gray-600">Let AI help identify your problem</p>
                    </div>
                    <button type="button" onClick={handleAIAssist} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2" >
                      <Zap className="w-4 h-4" /> AI Assist
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowServiceModal(false)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors" > Cancel </button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300" > Submit Request </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-red-600">Emergency Service Request</h2>
              <button onClick={() => setShowEmergencyModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors" >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Emergency Service Notice</h3>
                  <p className="text-sm text-red-700"> Emergency services typically cost 50-100% more than regular services due to immediate response requirements. You may be charged premium rates for after-hours, weekend, or holiday service calls. </p>
                </div>
              </div>
            </div>
            <form onSubmit={handleEmergencyServiceSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Description</label>
                <textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent h-32 resize-none" placeholder="Describe your emergency situation in detail..." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent" required >
                  <option value="">Select emergency type</option>
                  <option value="Plumbing">Plumbing Emergency</option>
                  <option value="Electrical">Electrical Emergency</option>
                  <option value="HVAC">Heating/Cooling Emergency</option>
                  <option value="Appliance Repair">Appliance Emergency</option>
                  <option value="Other">Other Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Location</label>
                <input type="text" value={serviceForm.location} onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Your exact address for emergency response" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Emergency Image</label>
                <div className="border-2 border-dashed border-red-300 rounded-xl p-6 text-center hover:border-red-400 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="emergency-image-upload" />
                  <label htmlFor="emergency-image-upload" className="cursor-pointer">
                    <Camera className="w-12 h-12 text-red-400 mx-auto mb-2" />
                    <p className="text-gray-600">Upload image to help responders assess the emergency</p>
                    {uploadedImage && <p className="text-red-600 mt-2 font-medium">{uploadedImage.name}</p>}
                  </label>
                </div>
              </div>
              {uploadedImage && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">Emergency AI Analysis</h3>
                      <p className="text-sm text-gray-600">Get instant problem assessment</p>
                    </div>
                    <button type="button" onClick={handleAIAssist} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2" >
                      <Zap className="w-4 h-4" /> AI Assist
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEmergencyModal(false)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors" > Cancel </button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2" >
                  <Zap className="w-5 h-5" /> Request Emergency Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
