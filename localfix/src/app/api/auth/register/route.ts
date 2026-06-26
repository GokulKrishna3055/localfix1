import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, phone, businessName, serviceCategory, location } = body

    // Basic validation
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Role-specific validation
    if (role === "provider") {
      if (!businessName || !serviceCategory || !location) {
        return NextResponse.json({ error: "Provider registration requires business details" }, { status: 400 })
      }
    }

    // Mock user creation
    // In a real app, you would:
    // 1. Hash the password
    // 2. Check if email already exists
    // 3. Save to database
    // 4. Send verification email
    // 5. Generate JWT token

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role,
      phone,
      ...(role === "provider" && {
        businessName,
        serviceCategory,
        location,
        verified: false,
      }),
      createdAt: new Date().toISOString(),
      emailVerified: false,
    }

    // Mock successful registration response
    const response = NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email for verification.",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      requiresVerification: true,
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
