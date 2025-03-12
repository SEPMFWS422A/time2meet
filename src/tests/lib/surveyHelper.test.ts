import { ISurveyPostBody } from '@/lib/interfaces/ISurveyPostBody';
import { mergeSurveyData } from '@/lib/SurveyHelpers/SurveyHelper';
import { expect, describe, it, beforeEach } from "@jest/globals";


describe('mergeSurveyData', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const baseSurveyData = {
    title: 'Test Survey',
    description: 'Test Description',
    location: 'Test Location',
    options: ['Option 1', 'Option 2'],
    status: 'active',
    participants: undefined
  };

  const baseSchedulingData = {
    dates: [{
      date: new Date('2024-10-24'),
      times: [{
        start: '09:00:00',
        end: '17:30:00'
      }]
    }]
  };

  it('should correctly merge basic survey data', () => {
    const result : ISurveyPostBody = mergeSurveyData(baseSurveyData, baseSchedulingData);
    
    expect(result.title).toBe(baseSurveyData.title);
    expect(result.description).toBe(baseSurveyData.description);
    expect(result.location).toBe(baseSurveyData.location);
    expect(result.status).toBe(baseSurveyData.status);
  });

  it('should format dates correctly', () => {
    const result : ISurveyPostBody = mergeSurveyData(baseSurveyData, baseSchedulingData);
    
    expect(result.dateTimeSelections[0].date).toBe('2024-10-24');
    expect(result.expiresAt).toBe('2024-01-21'); 
  });

  it('should format times correctly', () => {
    const result : ISurveyPostBody = mergeSurveyData(baseSurveyData, baseSchedulingData);
    
    expect(result.dateTimeSelections[0].timeSlots[0].startTime).toBe('09:00');
    expect(result.dateTimeSelections[0].timeSlots[0].endTime).toBe('17:30');
  });

  it('should map options correctly', () => {
    const result = mergeSurveyData(baseSurveyData, baseSchedulingData);
    
    expect(result.options).toEqual([
      { title: 'Option 1' },
      { title: 'Option 2' }
    ]);
  });

  it('should handle empty participants', () => {
    const withParticipants = {
      ...baseSurveyData,
      participants: ['user1@test.com', 'user2@test.com']
    };
    
    const result1 : ISurveyPostBody = mergeSurveyData(baseSurveyData, baseSchedulingData);
    const result2 : ISurveyPostBody= mergeSurveyData(withParticipants, baseSchedulingData);
    
    expect(result1.participants).toEqual([]);
    expect(result2.participants).toEqual(['user1@test.com', 'user2@test.com']);
  });

  it('should handle multiple dates and times', () => {
    const schedulingData = {
      dates: [
        {
          date: new Date('2024-12-24'),
          times: [
            { start: '09:00:00', end: '10:00:00' },
            { start: '11:00:00', end: '12:00:00' }
          ]
        },
        {
          date: new Date('2024-12-25'),
          times: [
            { start: '14:00:00', end: '15:00:00' }
          ]
        }
      ]
    };

    const result: ISurveyPostBody = mergeSurveyData(baseSurveyData, schedulingData);
    
    expect(result.dateTimeSelections).toHaveLength(2);
    expect(result.dateTimeSelections[0].timeSlots).toHaveLength(2);
    expect(result.dateTimeSelections[1].timeSlots).toHaveLength(1);
  });

  it('should handle one date and one time', () => {
    const schedulingData = {
      dates: [{
        date: new Date('2024-02-05'),
        times: [{ start: '00:00:00', end: '23:59:59' }]
      }]
    };

    const result: ISurveyPostBody = mergeSurveyData(baseSurveyData, schedulingData);
    
    expect(result.dateTimeSelections[0].date).toBe('2024-02-05');
    expect(result.dateTimeSelections[0].timeSlots[0].startTime).toBe('00:00');
    expect(result.dateTimeSelections[0].timeSlots[0].endTime).toBe('23:59');
  });
});