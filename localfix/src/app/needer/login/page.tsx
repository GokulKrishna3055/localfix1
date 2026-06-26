"use client";
import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OTPVerification from "../../otp-verification/page";
import { loginUser, registerUser } from "../../utils/api.js";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Users } from "lucide-react";
export const dynamic = "force-dynamic";

export default function NeederLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [userName, setUserName] = useState("");

  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });
  const parseIfString = (data: any) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data; // fallback if parsing fails
    }
  }
  return data;
};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          setMessage("❌ Please fill all required fields");
          setIsLoading(false);
          return;
        }

        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        if (res?.success) {
         const userObj = parseIfString(res.user);
  const neederObj = parseIfString(res.needer);

  // Extract neederId from token
  let neederId = "";
  try {
    const tokenPayload = JSON.parse(atob(res.token.split('.')[1]));
    neederId = tokenPayload.id;
  } catch {
    neederId = ""; // fallback
  }

  const neederWithId = {
    ...neederObj,
    neederId,
  };

  localStorage.setItem("token", res.token);
  localStorage.setItem("user", JSON.stringify(userObj));
  localStorage.setItem("needer", JSON.stringify(neederWithId));
         
          setEmailForOtp(formData.email);
          setUserName(res?.user?.username || res?.user?.name || "User");

          // Show OTP component (pass props)
          setShowOtp(true);
        } else {
          setMessage(res?.message || "❌ Login failed");
        }
      } else {
        // --- REGISTER FLOW ---
        if (
          !formData.username ||
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword ||
          !formData.phone
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

        const res = await registerUser({
          username: formData.username,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          role: "needer",
        });

        if (res?.success) {
          
          setIsLogin(true);
          setMessage("✅ Registration successful! Please log in.");
          setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            name: "",
            phone: "",
          });
        } else {
          setMessage(res?.message || "❌ Registration failed");
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setMessage("❌ Something went wrong: " + errorMessage);
    }

    setIsLoading(false);
  };

  // ✅ Callback after OTP verified
  // Accept optional user object as second param
  const handleOtpSuccess = (token: string, user?: any) => {
    localStorage.setItem("token", token);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.setItem("user", JSON.stringify({ email: emailForOtp }));
    }
    router.push("/needer/dashboard");
  };

  if (showOtp) {
    // pass props so OTPVerification will use them (it also falls back to query params)
    return (
      <OTPVerification
        email={emailForOtp}
        onSuccess={handleOtpSuccess}
        flow="login"
        name={userName}
      />
    );
  }

  // ----------------- (UI unchanged) -----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/auth"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Role Selection
          </Link>

          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Users className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? "Welcome Back" : "Join as Needer"}
          </h1>
          <p className="text-gray-600">
            {isLogin ? "Sign in to find local services" : "Create your account to get started"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {isLoading ? (isLogin ? "Signing In..." : "Creating Account...") : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* ✅ Show messages */}
          {message && <p className="mt-4 text-center text-sm font-medium text-red-500">{message}</p>}

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:text-blue-700 font-medium">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
