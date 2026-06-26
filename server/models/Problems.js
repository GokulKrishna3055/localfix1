import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false, // for normal request, optional in emergency
  },
  description: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  urgency: {
    type: String,
    enum: ["normal", "emergency"],
    default: "normal",
  },
  budget: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String, // store file path or Cloudinary URL
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status:{type:String, default:"Pending"}, // Pending, In Progress, Completed
  pickedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", default: null },
  providerContact: String,
  neederId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Problem", ProblemSchema);
