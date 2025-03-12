export interface ISurveyPostBody {
    title: string;
    description?: string;
    location?: string;
    options: { title: string }[]; 
    dateTimeSelections: { 
      date: string; 
      timeSlots: {
        startTime: string; 
        endTime: string;   
      }[];
    }[];
    expiresAt: string; 
    status: string; 
    participants?: string[]; 
  }