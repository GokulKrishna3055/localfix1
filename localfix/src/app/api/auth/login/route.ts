import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    // Basic validation
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Mock authentication logic
    // In a real app, you would:
    // 1. Hash the password and compare with stored hash
    // 2. Query your database for user credentials
    // 3. Generate JWT tokens
    // 4. Set secure cookies

    const mockUsers = {
      "admin@localfix.com": { role: "admin", password: "admin123" },
      "needer@test.com": { role: "needer", password: "password123" },
      "provider@test.com": { role: "provider", password: "password123" },
    }

    const user = mockUsers[email as keyof typeof mockUsers]

    if (!user || user.password !== password || user.role !== role) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Mock successful login response
    const response = NextResponse.json({
      success: true,
      user: {
        email,
        role,
        id: Math.random().toString(36).substr(2, 9),
      },
      token: "mock-jwt-token-" + Math.random().toString(36).substr(2, 9),
    })

    // Set HTTP-only cookie for session management
    response.cookies.set("auth-token", "mock-session-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
