"use client";
import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, RefreshCw } from "lucide-react"
import { resendOtp, verifyOtp } from "../utils/api"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"

type Props = {
  email?: string
  onSuccess?: (token: string, user?: any) => void
  flow?: string
  name?: string
}

export default function OTPVerification(props: Props) {
  const { email: propEmail, onSuccess, flow: propFlow, name: propName } = props;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const search = useSearchParams();

  // fallback to query params if props not provided
  const email = propEmail || search.get("email") || "";
  const flow = propFlow || search.get("flow") || "login";
  const neederName = propName || search.get("name") || "";

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  // Handle input change
  const handleChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;

    const res = await verifyOtp({ email, otp: code });

    if (res?.token) {
      // If parent passed a callback, let it handle token + user
      if (onSuccess) {
        onSuccess(res.token, res.user);
        return;
      }

      // fallback behavior (same as previously)
      localStorage.setItem("token", res.token);
      localStorage.setItem("neederName", neederName || res.user?.name || "");
      localStorage.setItem("user", JSON.stringify(res.user));

      if (flow === "register") {
        router.push("/needer/login");
      } else if (flow === "login") {
        router.push("/needer/dashboard");
      }
    } else {
      alert(res?.message || "Invalid or expired OTP");
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setIsResending(true);
    const res = await resendOtp({ email });
    setIsResending(false);
    if (res?.message === "OTP resent" || res?.success) {
      setTimeLeft(300);
      setOtp(["", "", "", "", "", ""]);
    } else {
      alert(res?.message || "Could not resend");
    }
  };

  // Format countdown timer
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23F97316' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/auth" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </Link>

          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto transform hover:scale-110 hover:rotate-12 transition-all duration-500">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify Your Account</h1>
          <p className="text-gray-600">Enter the 6-digit code sent to your phone / email</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 transform hover:shadow-2xl transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Verification Code</label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 transform hover:scale-105"
                    required
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Code expires in: <span className="font-mono font-bold text-orange-600">{formatTime(timeLeft)}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={otp.join("").length !== 6}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Verify Code
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={timeLeft > 0 || isResending}
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Code"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
