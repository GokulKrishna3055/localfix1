import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// const ProviderSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   businessName: { type: String, required: false },
//   serviceCategory: { type: String, required: true },
//   location: { type: String, required: true },
//   phone: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });
const ProviderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  businessName: { type: String, required: false },
  serviceCategory: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false }, //isVerified: { type: Boolean, default: false }, // admin sets true after verification
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
});
//  email,password:hashed,name,phone,buisnessName,serviceCategory,location
// Hash password before saving
ProviderSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
ProviderSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Provider || mongoose.model("Provider", ProviderSchema);
