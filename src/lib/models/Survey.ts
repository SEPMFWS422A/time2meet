import mongoose, { Schema, Document } from 'mongoose';

export interface ISurvey extends Document {
  titel: string;
  beschreibung?: string;
  ersteller: mongoose.Types.ObjectId; // Referenz auf den Ersteller
  gruppeId?: mongoose.Types.ObjectId; // Referenz auf eine Gruppe
  teilnehmer: mongoose.Types.ObjectId[]; // Liste der Teilnehmer-IDs
  
  datumsOptionen: {
    datum: Date;
    zeitSlots: {
      startZeit: string; // Format: "HH:MM"
      endZeit: string;   // Format: "HH:MM"
      waehler: mongoose.Types.ObjectId[]; // IDs der abstimmenden Benutzer
    }[];
  }[];
  
  erstelltAm: Date;
  laeuftAbAm?: Date;
  status: 'entwurf' | 'aktiv' | 'geschlossen';
  ort?: string;
}

const SurveySchema: Schema = new Schema({
  titel: { type: String, required: true },
  beschreibung: { type: String },
  ersteller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  gruppeId: { type: Schema.Types.ObjectId, ref: 'Group' },
  teilnehmer: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  datumsOptionen: [{
    datum: { type: Date, required: true },
    zeitSlots: [{
      startZeit: { type: String, required: true },
      endZeit: { type: String, required: true },
      waehler: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }]
  }],
  
  erstelltAm: { type: Date, default: Date.now },
  laeuftAbAm: { type: Date },
  status: { 
    type: String, 
    enum: ['entwurf', 'aktiv', 'geschlossen'],
    default: 'entwurf'
  },
  ort: { type: String }
}, { timestamps: true });

export default mongoose.models.Survey || mongoose.model<ISurvey>('Survey', SurveySchema);
