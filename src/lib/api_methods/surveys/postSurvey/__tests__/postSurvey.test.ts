import { postSurvey } from '../surveyPost'; 
import { ISurveyPostBody } from '@/lib/interfaces/ISurveyPostBody';
import { expect, describe, it, beforeEach, afterEach, } from '@jest/globals';

// Mock-Daten
const mockSurveyData: ISurveyPostBody = {
  title: 'Test Survey',
  description: 'Eine Testumfrage',
  location: 'Berlin',
  options: [{ title: 'Option 1' }, { title: 'Option 2' }],
  dateTimeSelections: [
    {
      date: '2023-12-01',
      timeSlots: [
        { startTime: '10:00', endTime: '11:00' },
        { startTime: '14:00', endTime: '15:00' },
      ],
    },
  ],
  expiresAt: '2023-12-31T23:59:59Z',
  status: 'active',
  participants: ['user1', 'user2'],
};

const mockSuccessResponse = {
  code: 201,
  message: 'Umfrage erfolgreich erstellt',
  status: 'success',
};

const mockErrorResponses = {
  400: {
    code: 400,
    message: 'Eingabefehler',
    status: 'error',
  },
  401: {
    code: 401,
    message: 'Unautorisiert',
    status: 'error',
  },
  403: {
    code: 403,
    message: 'Ungültige Session',
    status: 'error',
  },
};

describe('postSurvey', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 201,
        json: () => Promise.resolve(mockSuccessResponse),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('sollte die Umfrage erfolgreich erstellen und eine Erfolgsmeldung zurückgeben', async () => {
    const result = await postSurvey(mockSurveyData);

    expect(fetch).toHaveBeenCalledWith('api/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockSurveyData),
    });

    expect(result).toEqual(mockSuccessResponse);
  });

  it('sollte einen Eingabefehler (400) zurückgeben', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 400,
        json: () => Promise.resolve(mockErrorResponses[400]),
      })
    ) as jest.Mock;

    const result = await postSurvey(mockSurveyData);

    expect(result).toEqual(mockErrorResponses[400]);
  });

  it('sollte einen Unautorisiert-Fehler (401) zurückgeben', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 401,
        json: () => Promise.resolve(mockErrorResponses[401]),
      })
    ) as jest.Mock;

    const result = await postSurvey(mockSurveyData);

    expect(result).toEqual(mockErrorResponses[401]);
  });

  it('sollte einen Ungültige-Session-Fehler (403) zurückgeben', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 403,
        json: () => Promise.resolve(mockErrorResponses[403]),
      })
    ) as jest.Mock;

    const result = await postSurvey(mockSurveyData);

    expect(result).toEqual(mockErrorResponses[403]);
  });

  it('sollte einen Fehler werfen, wenn ein Netzwerkfehler auftritt', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Netzwerkfehler'))
    ) as jest.Mock;

    await expect(postSurvey(mockSurveyData)).rejects.toThrow('Netzwerkfehler');
  });
});