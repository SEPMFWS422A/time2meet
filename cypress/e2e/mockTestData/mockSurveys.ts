import {Survey} from "@/lib/interfaces/Survey";
import mockUser from "./mockUser";

const mockSurveys: Survey[] = [
    {
        _id: "75f8b2e5d4fba4c5e4b0bgn4",
        title: "Wanderung in den Bergen",
        description: "Gemeinsame Wanderung mit Freunden am Wochenende.",
        creator: mockUser._id,
        groupId: "groupA",
        participants: [mockUser._id, "65f8b2e5d4f8a4c6e4b0b1b1", "65f8b2e5d54654hb5464dgv54"],
        options: [
            { title: "Leichte Route", votedBy: ["user123"] },
            { title: "Mittelschwere Route", votedBy: ["user456", "user789"] }
        ],
        dateTimeSelections: [
            {
                date: new Date("2025-04-10"),
                timeSlots: [
                    {
                        startTime: "09:00",
                        endTime: "12:00",
                        yesVoters: ["user123", "user456"],
                        noVoters: [],
                        maybeVoters: ["user789"]
                    }
                ]
            }
        ],
        createdAt: new Date("2025-03-01"),
        expiresAt: new Date("2025-03-31"),
        status: "aktiv",
        location: "Alpenregion"
    },
    {
        _id: "4jf8b2ekd4f8a4c7e4b4bgng",
        title: "Spieleabend",
        creator: "65f8b2e5d4f8a4c6e4b0b1b1",
        participants: ["67b641a30a9f937f42f98a98", mockUser._id],
        options: [
            { title: "Brettspiele", votedBy: [] },
            { title: "Kartenspiele", votedBy: [] }
        ],
        dateTimeSelections: [
            {
                date: new Date("2025-04-15"),
                timeSlots: [
                    {
                        startTime: "18:00",
                        endTime: "22:00",
                        yesVoters: [],
                        noVoters: [],
                        maybeVoters: []
                    }
                ]
            }
        ],
        createdAt: new Date("2025-03-05"),
        status: "entwurf"
    },
    {
        _id: "3",
        title: "Team-Meeting",
        description: "Regelmäßiges Meeting zur Projektbesprechung.",
        creator: mockUser._id,
        participants: [mockUser._id, "67b641a30a9f937f42f98a98", "65f8b2e5d4f8a4c6e4b0b1a9", "65f8b2e5d4f8a4c6e4b0b1b1"],
        options: [],
        dateTimeSelections: [
            {
                date: new Date("2025-04-20"),
                timeSlots: [
                    {
                        startTime: "10:00",
                        endTime: "11:30",
                        yesVoters: [],
                        noVoters: [],
                        maybeVoters: []
                    }
                ]
            }
        ],
        createdAt: new Date("2025-03-07"),
        expiresAt: new Date("2025-04-19"),
        status: "geschlossen",
        location: "Online (Zoom)"
    }
];

export default mockSurveys;