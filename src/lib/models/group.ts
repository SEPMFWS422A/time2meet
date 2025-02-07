import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  groupname: { type: String, required: true },
  beschreibung: { type: String, default: "" },
  creator:{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  admins:{ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}], default: function(){ return [(this as any).creator]; }},
  members:{ type: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}], default: []},
  createdAt: { type: Date, default: Date.now }
});

if (mongoose.models.Group) {
  delete mongoose.models.Group;
}

export default mongoose.models.Group || mongoose.model("Group", GroupSchema);
