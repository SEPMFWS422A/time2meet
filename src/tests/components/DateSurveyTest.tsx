import React from 'react';
import DateSurvey from "@/components/DateSurvey";
import {fireEvent, render, screen} from '@testing-library/react';
import {expect, it} from '@jest/globals';

test("should increase vote count when a radio button is selected", () => {

    const onTimeSlotChange = jest.fn();
    const dateTimeSelections = [
        {
            date: new Date('2023-10-27T10:00:00.000Z'),
            timeSlots: [
                {
                    startTime: '10:00',
                    endTime: '11:00',
                    yesVoters: [],
                    noVoters: [],
                    maybeVoters: [],
                },
                {
                    startTime: '11:00',
                    endTime: '12:00',
                    yesVoters: [],
                    noVoters: [],
                    maybeVoters: [],
                },
            ],
        },
    ];

    const container = render(<DateSurvey  dateTimeSelections={dateTimeSelections} onTimeSlotChange={onTimeSlotChange} />);



    const yesButtons = screen.getAllByRole('radio', { name: 'Ja' });
    const yesButton1 = yesButtons[0]; // Erster "Ja"-Button
    const yesButton2 = yesButtons[1];

    const noButtons = screen.getAllByRole('radio', { name: 'Nein' });
    const noButton1 = noButtons[0]; // Erster "Ja"-Button
    const noButton2 = noButtons[1];

    const maybeButtons = screen.getAllByRole('radio', { name: 'Vielleicht' });
    const maybeButton1 = maybeButtons[0]; // Erster "Ja"-Button
    const maybeButton2 = maybeButtons[1];


        fireEvent.click(yesButton1);
        expect(onTimeSlotChange).toHaveBeenCalledWith(
            new Date('2023-10-27T10:00:00.000Z'),
            '10:00',
            '11:00',
            'ja'
        );

        fireEvent.click(noButton1);
        expect(onTimeSlotChange).toHaveBeenCalledWith(
            new Date('2023-10-27T10:00:00.000Z'),
            '10:00',
            '11:00',
            'nein'
        );

        fireEvent.click(maybeButton1);
        expect(onTimeSlotChange).toHaveBeenCalledWith(
            new Date('2023-10-27T10:00:00.000Z'),
            '10:00',
            '11:00',
            'vielleicht'
        );

        fireEvent.click(yesButton2);
        expect(onTimeSlotChange).toHaveBeenCalledWith(
            new Date('2023-10-27T10:00:00.000Z'),
            '11:00',
            '12:00',
            'ja'
        );

        fireEvent.click(noButton2);
        expect(onTimeSlotChange).toHaveBeenCalledWith(
            new Date('2023-10-27T10:00:00.000Z'),
            '11:00',
            '12:00',
            'nein'
        );

        fireEvent.click(maybeButton2);
        expect(onTimeSlotChange).toHaveBeenCalledWith(
            new Date('2023-10-27T10:00:00.000Z'),
            '11:00',
            '12:00',
            'vielleicht'
        );

        expect(onTimeSlotChange).toHaveBeenCalledTimes(6);




});
