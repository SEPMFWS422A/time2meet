import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  groupname: { type: String, required: true },
  beschreibung: { type: String, default: "" },
  creator:{ type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  admins:{ type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  members: { type: mongoose.Schema.Types.ObjectId, ref: "users"},
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Group || mongoose.model("groups", GroupSchema);
