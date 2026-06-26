import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Problem from "./models/Problems.js";
import Provider from "./models/Providers.js"; 
import Admin from "./models/adminSchema.js";
import PickedProblem from "./models/pickedProblem.js";
import { sendOtp } from "./utils/sms.js";
import twilio from "twilio";
import http from "http";
import { Server } from "socket.io";
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
//const maskPhone = (p) => (p?.length > 4 ? p.replace(/\d(?=\d{4})/g, "•") : p);
dotenv.config();
const signJwt = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const maskPhone = (phone) => phone.replace(/.(?=.{2})/g, "*");
const app = express();
const otpStore = {};
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);
const router = express.Router();
app.get("/", (req, res) => {
  res.send("Backend server is running ✅");
});
app.get("/users/by-email/:email", async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user by email:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, phone, role } = req.body;

    if (!username || !email || !password || !phone) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = new User({
      username,
      email,
      phone,
      password, // hashed automatically in User model (if you use pre-save hook)
      role: role || "needer",
    });

    await user.save();

    return res.json({
      success: true,
      message: "Registration successful ✅",
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});
const io = new Server(server, {
  cors: {
    origin: "*", // adjust for your frontend domain
    methods: ["GET", "POST"]
  }
});

// Make io accessible globally
global.io = io;

io.on("connection", (socket) => {
  console.log("New socket connected: " + socket.id);

  // Join room with neederId
  socket.on("joinRoom", (neederId) => {
    socket.join(neederId);
    console.log(`Needer ${neederId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected: " + socket.id);
  });
});
app.patch("/problems/:id/accept", async (req, res) => {
  try {
    const { providerId } = req.body; // provider id from frontend
    const updated = await Problem.findByIdAndUpdate(
      req.params.id,
      { status: "Accepted", providerId },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error accepting problem", error: err });
  }
});

// LOGIN → verify password → issue token
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "⚠️ Please fill all required fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "❌ User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ success: false, message: "❌ Invalid credentials" });

    // Generate OTP
    const otp = generateOTP();
    otpStore[email] = otp; // store OTP temporarily (can also save in DB with expiry)

    // Send OTP via Twilio SMS
    if (user.phone) {
      await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_FROM,
        to: user.phone,
      });
    }

    return res.json({
      success: true,
      message: "✅ Login successful. OTP sent.",
      user: { username: user.username, email: user.email, phone: maskPhone(user.phone),neederId:user._id },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({ success: false, message: "⚠️ Server error" });
  }
});

/**
 * VERIFY OTP → if match+not expired → clear OTP → mark phoneVerified → issue JWT
 */
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: "⚠️ Missing email or OTP" });

    if (otpStore[email] !== otp)
      return res.status(400).json({ success: false, message: "❌ Invalid or expired OTP" });

    // OTP correct → generate JWT
    const user = await User.findOne({ email });
    const token = signJwt(user._id);

    // Clear OTP from store
    delete otpStore[email];

    return res.json({
      success: true,
      message: "✅ OTP verified",
      token,
      user: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err.message);
    return res.status(500).json({ success: false, message: "⚠️ Server error" });
  }
});


/**
 * RESEND OTP → generate new code → save → SMS
 */
app.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "⚠️ Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "❌ User not found" });

    // Generate new OTP
    const otp = generateOTP();
    otpStore[email] = otp;

    // Send OTP again via Twilio
    if (user.phone) {
      await client.messages.create({
        body: `Your new OTP is ${otp}`,
        from: process.env.TWILIO_FROM,
        to: user.phone,
      });
    }

    return res.json({
      success: true,
      message: "🔄 OTP resent successfully",
      user: { email: user.email, phone: maskPhone(user.phone) },
    });
  } catch (err) {
    console.error("Resend OTP Error:", err.message);
    return res.status(500).json({ success: false, message: "⚠️ Server error" });
  }
});


app.post("/problems", async (req, res) => {
  try {
    // Assume the frontend sends the JWT token or we can extract user info from session
    // For simplicity, we’ll use neederId from the frontend localStorage (sent in req.body)
    const { title, description, category, urgency, budget, location, imageUrl } = req.body;

    // Instead of taking neederId from user input, frontend must send logged-in user's _id
    const userId = req.user?.id || req.body.neederId; // from JWT or frontend

    if (!userId) {
      return res.status(400).json({ success: false, message: "NeederId required" });
    }

    const newProblem = new Problem({
      title,
      description,
      category,
      urgency: urgency || "normal",
      budget,
      location,
      imageUrl: imageUrl || null,
      neederId: userId,  // automatically stores the logged-in needer ID
      status: "Pending",
    });

    await newProblem.save();
    res.status(201).json({ success: true, problem: newProblem });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});
app.get("/problems", async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/provider/register", async (req, res) => {
  try {
    const {name,businessName,serviceCategory,location,phone,email,password} = req.body;

    const existing = await Provider.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    //const hashed = await bcrypt.hash(password, 10);
    const provider = new Provider({ name,businessName,serviceCategory,location,phone,email,password,isVerified: false,
      verificationStatus: "pending",});

    await provider.save();

   res.status(201).json({ message: "Provider registered successfully", pro:provider});
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
  //  email: "",
  //   password: "",
  //   confirmPassword: "",
  //   name: "",
  //   phone: "",
  //   businessName: "",
  //   serviceCategory: "",
  //   location: "",
  //   name: { type: String, required: true },
  // businessName: { type: String, required: true },
  // serviceCategory: { type: String, required: true },
  // location: { type: String, required: true },
  // phone: { type: String, required: true },
  // email: { type: String, required: true, unique: true },
  // password: { type: String, required: true },
  // createdAt: { type: Date, default: Date.now },
});

// Login provider
app.post("/provider/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const provider = await Provider.findOne({ email });
    if (!provider) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Compare with provider.password, not user.password
    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: provider._id, role: provider.role }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        _id: provider._id,
        email: provider.email,
        role: provider.role,
        isVerified: !!provider.isVerified,
        verificationStatus: provider.verificationStatus || "pending",
      },
    });

    // res.json({
    //   _id: provider._id,
    //   name: provider.name,
    //   email: provider.email,
    //   token: jwt.sign({ id: provider._id }, process.env.JWT_SECRET, { expiresIn: "7d" }),
    // });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all providers
app.get("/admin/providers", async (req, res) => {
  try {
    const providers = await Provider.find().sort({ createdAt: -1 });
    res.json({ success: true, data: providers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH: Approve or Reject a provider
app.patch("/admin/providers/:id", async (req, res) => {
  try {
    const { action } = req.body; // action: "approve" or "reject"

    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });

    if (action === "approve") {
      provider.isVerified = true;
      provider.verificationStatus = "approved";
    } else if (action === "reject") {
      provider.isVerified = false;
      provider.verificationStatus = "rejected";
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    await provider.save();
    res.json({ success: true, data: provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/providers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findById(id).select("-password"); // exclude password

    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    res.json({ success: true, provider });
  } catch (err) {
    console.error("Error fetching provider:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/admin/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Admin already registered" });

    // generate unique secret key
    const secretKey = Math.random().toString(36).substring(2, 10).toUpperCase();

    const admin = new Admin({ name, email, password, secretKey });
    await admin.save();

    res.json({
      success: true,
      message: "Admin registered successfully ✅",
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        secretKey, // show secret key once after registration
      },
    });
  } catch (err) {
    console.error("Admin register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ADMIN LOGIN
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    if (!email || !password || !secretKey) {
      return res.status(400).json({ message: "Please provide email, password and secret key" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const validPass = await bcrypt.compare(password, admin.password);
    if (!validPass) return res.status(400).json({ message: "Invalid password" });

    if (secretKey !== admin.secretKey) {
      return res.status(400).json({ message: "Invalid secret key" });
    }

    // ✅ issue token
    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Admin login successful ✅",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
const getProvider = async (req, res, next) => {
  try {
    const providerId = req.body.providerId; // or req.user._id if using auth
    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });
    req.provider = provider;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// PUT /problems/:id/pick
// Provider picks a problem
app.post("/problems/:id/pick", async (req, res) => {
  try {
    const problemId = req.params.id;
    const { providerId, providerContact } = req.body;

    if (!providerId) return res.status(400).json({ success: false, message: "ProviderId is required" });

    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });

    // Update problem status
    problem.status = "In Progress";
    problem.pickedBy = providerId;
    await problem.save();

    // Create picked problem
    const picked = new PickedProblem({
      title: problem.title,
      description: problem.description,
      status: problem.status,
      location: problem.location,
      pickedBy: providerId,
      providerContact,
      neederId: problem.neederId
    });
    await picked.save();

    res.json({ success: true, problem, provider });
  } catch (err) {
    console.error("Error picking problem:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// GET /picked-problems/provider/:id
app.get("/picked-problems/provider/:id", async (req, res) => {
  try {
    const providerId = req.params.id
    const picked = await PickedProblem.find({ pickedBy: providerId }).sort({ createdAt: -1 })
    res.json(picked)
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// backend route example
app.put("/picked-problems/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Update picked problem
    const picked = await PickedProblem.findByIdAndUpdate(id, { status }, { new: true });
    if (!picked) return res.status(404).json({ success: false, message: "Picked problem not found" });

    // Update corresponding problem in Problem collection
    await Problem.findByIdAndUpdate(picked.problemId, { status:picked.status });

    res.json({ success: true, picked });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.post("/update-problem/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const problem = await Problem.findById(req.params.id).populate("neederId");

    if (!problem) return res.status(404).json({ message: "Problem not found" });

    problem.status = status;
    await problem.save();

    // Send alert to the needer (not provider)
    if (problem.neederId) {
      // Example using Socket.io
      io.to(problem.neederId._id.toString()).emit("alert", {
        message: `Your problem "${problem.title}" status is now: ${status}`,
      });
    }

    res.json({ success: true, message: "Problem updated successfully" });
  } catch (err) {
    console.error("Error updating problem:", err);
    res.status(500).json({ message: "Server error" });
  }
});
//app.use("/api", authRoutes);
// Fetch recent problems for a specific needer
app.get("/problems/:neederId", async (req, res) => {
  // const { neederId } = req.params;

  // try {
  //   // 1. Fetch picked problems
  //   const pickedProblems = await PickedProblem.find({ neederId }).populate("providerId", "name");

  //   // 2. Format picked problems
  //   const formattedPicked = pickedProblems.map((p) => ({
  //     _id: p.problemId,  // Use original Problem _id
  //     title: p.title,
  //     description: p.description,
  //     category: p.category,
  //     urgency: p.urgency,
  //     budget: p.budget,
  //     location: p.location,
  //     imageUrl: p.imageUrl,
  //     status: p.status || "In Progress",
  //     pickedBy: p.providerId ? p.providerId.name : "Pending",
  //     neederId: p.neederId,
  //   }));

  //   // 3. Fetch unpicked problems
  //   const pickedProblemIds = pickedProblems.map((p) => p.problemId); // Original problem IDs
  //   const unpickedProblems = await Problem.find({ neederId, _id: { $nin: pickedProblemIds } });

  //   const formattedUnpicked = unpickedProblems.map((p) => ({
  //     _id: p._id,
  //     title: p.title,
  //     description: p.description,
  //     category: p.category,
  //     urgency: p.urgency,
  //     budget: p.budget,
  //     location: p.location,
  //     imageUrl: p.imageUrl,
  //     status: "Pending",
  //     pickedBy: "None",
  //   }));

  //   // Merge both
  //   const allProblems = [...formattedPicked, ...formattedUnpicked];

  //   res.json({ success: true, problems: allProblems });
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({ success: false, message: "Failed to fetch problems" });
  // }
  try {
    const problems = await Problem.find({ neederId: req.params.neederId })
      .populate("pickedBy", "name email") // ✅ add provider details
      .sort({ createdAt: -1 });

    res.json({ success: true, problems });
  } catch (err) {
    console.error("Error fetching problems:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Fetch picked problems by provider
app.get("/problems/provider/:providerId", async (req, res) => {
  try {
    const problems = await Problem.find({ pickedBy: req.params.providerId });
    res.json({ success: true, problems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update problem status (completed or cancelled)
app.put("/problems/:problemId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const problem = await Problem.findByIdAndUpdate(
      req.params.problemId,
      { status },
      { new: true }
    );
    res.json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4, // Force IPv4
  })
  .then(() => {
    console.log("✅ MongoDB connected");

    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed");
    console.error(err); // Print full error instead of only message
  });