export interface Survey {
    _id: string;
    title: string;
    description?: string;
    creator: string;
    groupId?: string;
    participants: string[];
    options: {
        title: string;
        votedBy: string[];
    }[];
    dateTimeSelections: {
        date: Date;
        timeSlots: {
            startTime: string;
            endTime: string;
            yesVoters: string[];
            noVoters: string[];
            maybeVoters: string[];
        }[];
    }[];
    createdAt: Date;
    expiresAt?: Date;
    status: 'entwurf' | 'aktiv' | 'geschlossen';
    location?: string;
}