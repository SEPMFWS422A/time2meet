import React from 'react';
import DateSurvey from "@/components/DateSurvey";
import { render, screen } from '@testing-library/react';
import { expect } from '@jest/globals';

test("Events API Route", () => {
    const mock = () => {};
    const data = [{
        date: new Date('heute'),
        timeSlots: [
            {startTime: '',
                endTime:'',
                yesVoters: [''],
                noVoters:[''],
                maybeVoters: ['']
            }
        ]
    }];
    const container = render(<DateSurvey  dateTimeSelections={data} onTimeSlotChange={mock} />);

    expect(container).toBeTruthy();
});
