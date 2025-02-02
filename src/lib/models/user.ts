import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  user_id: { type: Number, unique: true, required: true },
  name: { type: String},
  vorname: { type: String},
  email: { type: String, unique: true, required: true },
  benutzername: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  telefonnummer: { type: String, default: null },
  geburtsdatum: { type: Date, default: null },
  freunde: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  profilsichtbarkeit: {type: String, enum: ["öffentlich", "Privat", "Nur freunde"],default: "öffentlich"},
  kalendersichtbarkeit: {type: String, enum: ["öffentlich", "Privat", "Nur freunde"],default: "öffentlich"},
  theme: {type: String, enum: ["Hell", "dunkel"],default: "Hell"},
  profilbild: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model("users", UserSchema);
