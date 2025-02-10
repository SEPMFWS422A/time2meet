import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  description: { type: String, default: "" },
  location: { type: String, default: "" },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  allday: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);