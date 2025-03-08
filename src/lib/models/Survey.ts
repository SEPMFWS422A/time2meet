import mongoose, { Schema, Document } from 'mongoose';

export interface ISurvey extends Document {
  titel: string;
  description?: string;
  creator: mongoose.Types.ObjectId; // Referenz auf den Ersteller
  groupId?: mongoose.Types.ObjectId; // Referenz auf eine Gruppe
  participants: mongoose.Types.ObjectId[]; // Liste der Teilnehmer-IDs
  options:{
    title: string;
    votedBy: mongoose.Types.ObjectId[];
  }[];
  
  dateTimeSelections: {
    date: Date;
    timeSlots: {
      startTime: string; // Format: "HH:MM"
      endTime: string;   // Format: "HH:MM"
      yesVoters: mongoose.Types.ObjectId[]; 
      noVoters: mongoose.Types.ObjectId[];  
      maybeVoters: mongoose.Types.ObjectId[]; 
    }[];
  }[];
  createdAt: Date;
  expiresAt?: Date;
  status: 'entwurf' | 'aktiv' | 'geschlossen';
  location?: string;
}

const SurveySchema: Schema = new Schema({
  titel: { type: String, required: true },
  description: { type: String },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  options: [{ 
    title: { type: String, required: true },
    votedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
   }],  
  dateTimeSelections: [{
    date: { type: Date, required: true },
    timeSlots: [{
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      yesVoters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      noVoters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      maybeVoters: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }]
  }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  status: { 
    type: String, 
    enum: ['entwurf', 'aktiv', 'geschlossen'],
    default: 'entwurf'
  },
  location: { type: String }
}, { timestamps: true });

export default mongoose.models.Survey || mongoose.model<ISurvey>('Survey', SurveySchema);
