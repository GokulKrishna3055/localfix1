import mongoose from "mongoose";

const pickedProblemSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, default: "In Progress" },
  location: String,
  createdAt: { type: Date, default: Date.now },
  pickedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" },
 
  providerContact: String,
  neederId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("PickedProblem", pickedProblemSchema);
