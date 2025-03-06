import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] },
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: false }, // Hier `required: false` setzen
  description: { type: String, default: "" },
  location: { type: String, default: "" },
  groups: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }], default: [] },
  allday: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Falls das Modell bereits existiert, wird es gelöscht, um eine Mehrfachregistrierung zu verhindern.
if (mongoose.models.Event) {
  delete mongoose.models.Event;
}

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
