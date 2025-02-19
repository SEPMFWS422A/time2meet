import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  groupname: { type: String, required: true },
  beschreibung: { type: String, default: "" },
  creator:{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] ,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});
  
export default mongoose.models.Group || mongoose.model("Group", GroupSchema);
