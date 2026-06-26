import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, type } = body

    // Basic validation
    if (!email || !otp || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // OTP validation
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 })
    }

    // Mock OTP verification
    // In a real app, you would:
    // 1. Check if OTP exists in database/cache
    // 2. Verify it hasn't expired
    // 3. Compare with stored OTP
    // 4. Mark user as verified
    // 5. Clean up used OTP

    // Mock valid OTP for demo purposes
    const validOTP = "123456"

    if (otp !== validOTP) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
    }

    // Mock successful verification
    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully",
      verified: true,
      redirectTo: type === "registration" ? "/auth" : "/dashboard",
    })

    // Set verification cookie
    response.cookies.set("email-verified", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
