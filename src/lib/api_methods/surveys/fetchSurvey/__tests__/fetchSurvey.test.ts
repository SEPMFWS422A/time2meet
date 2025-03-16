import { ISurvey } from '@/lib/interfaces/ISurvey';
import { expect, describe, it, beforeEach, afterEach } from '@jest/globals';
import fetchParticipatingSurveys from "@/lib/api_methods/surveys/fetchParticipatingSurveys/fetchParticipatingSurveys";

// Mock-Daten
const mockSurveys: ISurvey[] = [
    {
        _id: '1',
        title: 'Survey 1',
        description: 'Description 1',
        creator: 'user1',
        participants: ['user1', 'user2'],
        options: [
            {
                title: 'Option 1',
                votedBy: ['user1'],
            },
            {
                title: 'Option 2',
                votedBy: ['user2'],
            },
        ],
        dateTimeSelections: [
            {
                date: new Date('2023-12-01'),
                timeSlots: [
                    {
                        startTime: '10:00',
                        endTime: '11:00',
                        yesVoters: ['user1'],
                        noVoters: [],
                        maybeVoters: ['user2'],
                    },
                    {
                        startTime: '14:00',
                        endTime: '15:00',
                        yesVoters: ['user2'],
                        noVoters: ['user1'],
                        maybeVoters: [],
                    },
                ],
            },
        ],
        createdAt: new Date('2023-11-01'),
        expiresAt: new Date('2023-12-31'),
        status: 'aktiv',
        location: 'Berlin',
    },
    {
        _id: '2',
        title: 'Survey 2',
        description: 'Description 2',
        creator: 'user2',
        participants: ['user2', 'user3'],
        options: [
            {
                title: 'Option 1',
                votedBy: ['user2'],
            },
            {
                title: 'Option 2',
                votedBy: ['user3'],
            },
        ],
        dateTimeSelections: [
            {
                date: new Date('2023-12-02'),
                timeSlots: [
                    {
                        startTime: '09:00',
                        endTime: '10:00',
                        yesVoters: ['user2'],
                        noVoters: ['user3'],
                        maybeVoters: [],
                    },
                ],
            },
        ],
        createdAt: new Date('2023-11-02'),
        expiresAt: new Date('2023-12-31'),
        status: 'aktiv',
        location: 'Hamburg',
    },
];

describe('fetchParticipatingSurveys', () => {
    beforeEach(() => {
        global.fetch = jest.fn() as jest.Mock;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    // Test 1: Erfolgreiches Abrufen der teilnehmenden Umfragen
    it('sollte die teilnehmenden Umfragen erfolgreich abrufen und zurückgeben', async () => {
        // Mock für eine erfolgreiche fetch-Antwort
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockSurveys),
        });

        const result = await fetchParticipatingSurveys();

        // Überprüfe, ob fetch mit der richtigen URL aufgerufen wurde
        expect(fetch).toHaveBeenCalledWith('/api/surveys/participating');

        // Überprüfe, ob das erwartete Ergebnis zurückgegeben wird
        expect(result).toEqual(mockSurveys);
    });

    // Test 3: Ungültige Antwort vom Server (res.ok ist false)
    it("should return null if response is not ok", async () => {
        // Mock für eine ungültige fetch-Antwort (res.ok ist false)
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve(null),
        });

        const result = await fetchParticipatingSurveys();

        expect(result).toBeNull();
        expect(fetch).toHaveBeenCalledWith("/api/surveys/participating");
    });
});