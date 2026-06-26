import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type } = body

    // Basic validation
    if (!email || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Mock OTP generation and sending
    // In a real app, you would:
    // 1. Generate a new 6-digit OTP
    // 2. Store it in database/cache with expiration
    // 3. Send email with OTP
    // 4. Implement rate limiting

    const newOTP = Math.floor(100000 + Math.random() * 900000).toString()

    // Mock email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log(`Mock OTP for ${email}: ${newOTP}`) // In real app, this would be sent via email

    return NextResponse.json({
      success: true,
      message: "New verification code sent to your email",
      expiresIn: 300, // 5 minutes
    })
  } catch (error) {
    console.error("Resend OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
