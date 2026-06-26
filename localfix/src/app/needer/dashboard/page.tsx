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

export const dynamic = "force-dynamic";

export default function Page() {
  return <NeederDashboardClient />;
}
