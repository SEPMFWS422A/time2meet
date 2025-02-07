import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  creator: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  groups: mongoose.Types.ObjectId[];
  allday: boolean;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  description: { type: String, default: "" },
  location: { type: String, default: "" },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "groups" }],
  allday: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// **Verhindert Mehrfachregistrierung des Modells**
const Event = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
export default Event;
