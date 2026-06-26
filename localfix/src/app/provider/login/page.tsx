// "use client"

// import type React from "react"
// import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { ArrowLeft, Mail, Lock, Eye, EyeOff, Wrench, MapPin, Briefcase } from "lucide-react"
// import { registerProvider, loginProvider } from "../../utils/api.js";

// export default function ProviderLogin() {
//   const [isLogin, setIsLogin] = useState(true)
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [verificationPending, setVerificationPending] = useState(false)
//   const [tentativeDateStr, setTentativeDateStr] = useState<string | null>(null)
//   const router = useRouter()
//   const [message, setMessage] = useState("");

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     confirmPassword: "",
//     name: "",
//     phone: "",
//     businessName: "",
//     serviceCategory: "",
//     location: "",
//   })

//   const serviceCategories = [
//     "Plumbing",
//     "Electrical",
//     "Cleaning",
//     "Gardening",
//     "Painting",
//     "Carpentry",
//     "HVAC",
//     "Appliance Repair",
//     "Moving",
//     "Other",
//   ]

//   const getTentativeDateString = () => {
//     const today = new Date();
//     const daysToAdd = Math.floor(Math.random() * (7 - 4 + 1)) + 4; // 4..7 days
//     const tentativeDate = new Date(today);
//     tentativeDate.setDate(today.getDate() + daysToAdd);
//     const options: Intl.DateTimeFormatOptions = {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     };
//     return tentativeDate.toLocaleDateString("en-US", options);
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isLoading) return;
//     setIsLoading(true);
//     setMessage("");

//     try {
//       if (isLogin) {
//         // --- LOGIN FLOW ---
//         if (!formData.email || !formData.password) {
//           setMessage("❌ Please fill all required fields");
//           setIsLoading(false);
//           return;
//         }

//         const res = await loginProvider({
//           email: formData.email,
//           password: formData.password,
//         });

//         console.log("Login response:", res);

//         if (res?.token) {
//           localStorage.setItem("token", res.token);
//           localStorage.setItem("user", JSON.stringify(res.user ?? {}));
//           setMessage("✅ Login successful — redirecting...");
//           router.push("/provider/dashboard");
//         } else {
//           setMessage(res?.message || "❌ Login failed");
//         }
//       } else {
//         // --- REGISTER FLOW ---
//         if (
//           !formData.name ||
//           !formData.email ||
//           !formData.password ||
//           !formData.confirmPassword ||
//           !formData.phone ||
//           !formData.businessName ||
//           !formData.serviceCategory ||
//           !formData.location
//         ) {
//           setMessage("❌ Please fill all required fields");
//           setIsLoading(false);
//           return;
//         }

//         if (formData.password !== formData.confirmPassword) {
//           setMessage("❌ Passwords do not match");
//           setIsLoading(false);
//           return;
//         }

//         const payload = {
//           name: formData.name,
//           phone: formData.phone,
//           email: formData.email,
//           password: formData.password,
//           role: "provider",
//           businessName: formData.businessName,
//           serviceCategory: formData.serviceCategory,
//           location: formData.location,
//         };

//         const res = await registerProvider(payload);
//         console.log("Register response:", res);

//         // flexible success detection (works with different backend shapes)
//         const registered =
//           res &&
//           (res.success === true ||
//             !!res.user ||
//             !!res.userId ||
//             !!res.token ||
//             /registered/i.test(res?.message || ""));

//         if (registered) {
//           // DO NOT auto-switch to login. Show verification pending message.
//           const dateStr = getTentativeDateString();
//           setTentativeDateStr(dateStr);
//           setVerificationPending(true);

//           // Clear sensitive fields but keep other info visible
//           setFormData((prev) => ({
//             ...prev,
//             password: "",
//             confirmPassword: "",
//           }));

//           setMessage(
//             `✅ Application submitted! Our admin team has been notified. A verification team will visit your service location on or around ${dateStr}, tentatively between 10:00 AM and 5:00 PM. ⚠️ Disclaimer: This date/time is tentative. Our team may visit at a different time but will send prior notification to your registered email. You will be able to log in after successful verification.`
//           );
//         } else {
//           setMessage(res?.message || "❌ Registration failed");
//         }
//       }
//     } catch (err: unknown) {
//       console.error("Error in handleSubmit:", err);
//       const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
//       setMessage("❌ Something went wrong: " + errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
//       {/* Background Pattern */}
//       <div className="fixed inset-0 opacity-5 pointer-events-none">
//         <div
//           className="absolute inset-0"
//           style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%2310B981' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//           }}
//         />
//       </div>

//       <div className="w-full max-w-md relative z-10">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <Link
//             href="/auth"
//             className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5 mr-2" />
//             Back to Role Selection
//           </Link>

//           <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto transform hover:scale-110 hover:rotate-12 transition-all duration-500">
//             <Wrench className="w-8 h-8 text-white" />
//           </div>

//           <h1 className="text-3xl font-bold text-gray-800 mb-2">{isLogin ? "Welcome Back" : "Join as Provider"}</h1>
//           <p className="text-gray-600">
//             {isLogin ? "Sign in to manage your services" : "Start offering your services today"}
//           </p>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 transform hover:shadow-2xl transition-all duration-300 max-h-[80vh] overflow-y-auto">

//           {/* Message / Alert */}
//           {message && (
//             <div
//               className={`mb-4 p-3 rounded-lg ${
//                 verificationPending ? "bg-yellow-50 border border-yellow-200 text-yellow-800" : "bg-green-50 border border-green-200 text-green-800"
//               }`}
//               role="status"
//             >
//               <div className="text-sm whitespace-pre-line">{message}</div>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {!isLogin && (
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
//                     placeholder="Enter your full name"
//                     required
//                     disabled={verificationPending}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
//                   <div className="relative">
//                     <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       value={formData.businessName}
//                       onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
//                       className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
//                       placeholder="Enter your business name"
//                       required
//                       disabled={verificationPending}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
//                   <select
//                     value={formData.serviceCategory}
//                     onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
//                     required
//                     disabled={verificationPending}
//                   >
//                     <option value="">Select a category</option>
//                     {serviceCategories.map((category) => (
//                       <option key={category} value={category}>
//                         {category}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Service Location</label>
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       value={formData.location}
//                       onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                       className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
//                       placeholder="Enter your service area"
//                       required
//                       disabled={verificationPending}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
//                   <input
//                     type="tel"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
//                     placeholder="Enter your phone number"
//                     required
//                     disabled={verificationPending}
//                   />
//                 </div>
//               </div>
//             )}

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
//                   placeholder="Enter your email"
//                   required
//                   disabled={verificationPending}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
//                   placeholder="Enter your password"
//                   required
//                   disabled={verificationPending}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {!isLogin && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="password"
//                     value={formData.confirmPassword}
//                     onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                     className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
//                     placeholder="Confirm your password"
//                     required
//                     disabled={verificationPending}
//                   />
//                 </div>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={isLoading || verificationPending}
//               className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center">
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                   {isLogin ? "Signing In..." : "Creating Account..."}
//                 </div>
//               ) : isLogin ? (
//                 "Sign In"
//               ) : (
//                 "Create Account"
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <button
//               onClick={() => setIsLogin(!isLogin)}
//               className="text-green-600 hover:text-green-700 font-medium transition-colors"
//             >
//               {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
// app/provider/login/page.tsx  (or wherever your file lives)
// keep "use client" and same styling/classes — only behavior changed
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Wrench,
  MapPin,
  Briefcase,
} from "lucide-react";
import { registerProvider, loginProvider } from "../../utils/api.js";

export default function ProviderLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [tentativeDateStr, setTentativeDateStr] = useState<string | null>(
    null
  );
  const router = useRouter();
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    businessName: "",
    serviceCategory: "",
    location: "",
  });

  const serviceCategories = [
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Gardening",
    "Painting",
    "Carpentry",
    "HVAC",
    "Appliance Repair",
    "Moving",
    "Other",
  ];

  const getTentativeDateString = () => {
    const today = new Date();
    const daysToAdd = Math.floor(Math.random() * (7 - 4 + 1)) + 4; // 4..7 days
    const tentativeDate = new Date(today);
    tentativeDate.setDate(today.getDate() + daysToAdd);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return tentativeDate.toLocaleDateString("en-US", options);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        if (!formData.email || !formData.password) {
          setMessage("❌ Please fill all required fields");
          setIsLoading(false);
          return;
        }

        const res = await loginProvider({
          email: formData.email,
          password: formData.password,
        });

        console.log("Login response:", res);

        if (res?.token) {
          // Save token + user object (useful later)
          localStorage.setItem("token", res.token);
          if (res.user) localStorage.setItem("user", JSON.stringify(res.user));
          localStorage.setItem("provider", JSON.stringify(res.user));

          // IMPORTANT: backend must return res.user.isVerified (boolean)
          if (res.user?.isVerified === false || res.user?.verificationStatus === "pending") {
            // keep user on pending message screen — do NOT redirect
            setVerificationPending(true);
            const dateStr = getTentativeDateString();
            setTentativeDateStr(dateStr);
            setMessage(
              `⚠️ Your account is pending admin verification. A verification team will visit your service location on or around ${dateStr} between 10:00 AM and 5:00 PM (tentative). You'll be able to log in after verification.`
            );
          } else {
            // verified -> allow redirect to dashboard

            setMessage("✅ Login successful — redirecting...");
            localStorage.setItem("provider", JSON.stringify(res.user));
            router.push("/provider/dashboard");
          }
        } else {
          setMessage(res?.message || "❌ Login failed");
        }
      } else {
        // --- REGISTER FLOW ---
        if (
          !formData.name ||
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword ||
          !formData.phone ||
          !formData.businessName ||
          !formData.serviceCategory ||
          !formData.location
        ) {
          setMessage("❌ Please fill all required fields");
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setMessage("❌ Passwords do not match");
          setIsLoading(false);
          return;
        }

        const payload = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          role: "provider",
          businessName: formData.businessName,
          serviceCategory: formData.serviceCategory,
          location: formData.location,
        };

        const res = await registerProvider(payload);
        console.log("Register response:", res);

        const registered =
          res &&
          (res.success === true ||
            !!res.user ||
            !!res.userId ||
            /registered/i.test(res?.message || "") ||
            res.status === "ok");

        if (registered) {
          // Trigger verification pending flow
          const dateStr = getTentativeDateString();
          setTentativeDateStr(dateStr);
          setVerificationPending(true);

          // Clear passwords but keep other data for display if needed
          setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));

          setMessage(
            `✅ Application submitted! Our admin team has been notified. A verification team will visit your service location on or around ${dateStr}, tentatively between 10:00 AM and 5:00 PM.\n\n⚠️ Disclaimer: This date/time is tentative. Our team may visit at a different time but will send prior notification to your registered email. You will be able to log in after successful verification.`
          );
          if (res.user) localStorage.setItem("provider", JSON.stringify(res.user));

        } else {
          setMessage(res?.message || "❌ Registration failed");
        }
      }
    } catch (err: unknown) {
      console.error("Error in handleSubmit:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setMessage("❌ Something went wrong: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%2310B981' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/auth"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Role Selection
          </Link>

          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto transform hover:scale-110 hover:rotate-12 transition-all duration-500">
            <Wrench className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">{isLogin ? "Welcome Back" : "Join as Provider"}</h1>
          <p className="text-gray-600">
            {isLogin ? "Sign in to manage your services" : "Start offering your services today"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 transform hover:shadow-2xl transition-all duration-300 max-h-[80vh] overflow-y-auto">

          {/* Message / Alert */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                verificationPending ? "bg-yellow-50 border border-yellow-200 text-yellow-800" : "bg-green-50 border border-green-200 text-green-800"
              }`}
              role="status"
            >
              <div className="text-sm whitespace-pre-line">{message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                    required
                    disabled={verificationPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your business name"
                      required
                      disabled={verificationPending}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                  <select
                    value={formData.serviceCategory}
                    onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    required
                    disabled={verificationPending}
                  >
                    <option value="">Select a category</option>
                    {serviceCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your service area"
                      required
                      disabled={verificationPending}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your phone number"
                    required
                    disabled={verificationPending}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                  required
                  disabled={verificationPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  required
                  disabled={verificationPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="Confirm your password"
                    required
                    disabled={verificationPending}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || verificationPending}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? "Signing In..." : "Creating Account..."}
                </div>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
