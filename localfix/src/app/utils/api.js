export const API_URL = "process.env.NEXT_PUBLIC_API_URL"; // backend runs on port 5000

// Example: register user
export async function registerUser(providerData) {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(providerData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Provider registration failed");
    }

    return data;
  } catch (err) {
    return { message: err.message || "Error registering provider" };
  }
}

export async function getProblems() {
  const res = await fetch("/problems")
  return res.json()
}

export async function acceptProblem(problemId) {
  const res = await fetch(`/problems/${problemId}/accept`, {
    method: "PATCH",
  })
  return res.json()
}
// Login Provider
export async function loginUser(providerData) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(providerData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Provider login failed");
    }

    return data;
  } catch (err) {
    return { message: err.message || "Error logging in provider" };
  }
}


// Example: get profile (protected route)
export async function getProfile(token) {
  const res = await fetch(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
export async function createProblem(problemData) {
  try{
  const res = await fetch(`${API_URL}/problems`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(problemData),
  });
  const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (err) {
    return { message: err.message || "Error logging in" };
  }
}

export async function fetchProblems() {
  try{
  const res = await fetch(`${API_URL}/problems`);
  const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  
  } catch (err) {
    return { message: err.message || "Error logging in" };
  }
}

async function handleFetch(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    throw new Error((body && body.message) || body || res.statusText || "API error");
  }
  return body;
}

export const registerProvider = async (providerData) => {
  // try {
  //   const res = await fetch(`${API_URL}/provider/register`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(providerData),
  //   });

  //   const result = await res.json();
  //   if (!res.ok) {
  //     return { success: false, message: result.message || "Registration failed" };
  //   }
  //   return { success: true, ...result };
  // } catch (err) {
  //   return { success: false, message: err.message || "Network error" };
  // }
  try {
    const res = await fetch(`${API_URL}/provider/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(providerData),
    });
    return await handleFetch(res);
  } catch (err) {
    console.error("registerProvider error:", err);
    return { success: false, message: err.message || "Network error" };
  }
};

// LOGIN PROVIDER
export const loginProvider = async (credentials) => {
  // try {
  //   const res = await fetch(`${API_URL}/provider/login`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(credentials),
  //   });

  //   const result = await res.json();
  //   if (!res.ok) {
  //     return { success: false, message: result.message || "Login failed" };
  //   }
  //   return { success: true, ...result };
  // } catch (err) {
  //   return { success: false, message: err.message || "Network error" };
  // }
  try {
    const res = await fetch(`${API_URL}/provider/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return await handleFetch(res);
  } catch (err) {
    console.error("loginProvider error:", err);
    return { success: false, message: err.message || "Network error" };
  }
};
export async function verifyOtp({ email, otp }) {
  const r = await fetch(`${API_URL}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return r.json();
}

export async function resendOtp({ email }) {
  const r = await fetch(`${API_URL}/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return r.json();
}
