

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ParticipantSelector from "@/components/ChooseParticipants";

jest.mock('@/components/ModalWindow', () => ({
    __esModule: true,
    default: ({ isOpen, onOpenChange, content, title, size }) => (
        <div data-testid="modal" style={{ display: isOpen ? 'block' : 'none' }}>
            <div data-testid="modal-title">{title}</div>
            <div data-testid="modal-content">{content}</div>
            <button data-testid="modal-close" onClick={onOpenChange}>Schließen</button>
        </div>
    ),
}));


jest.mock("@heroui/react", () => ({
    ...jest.requireActual("@heroui/react"),
    Button: ({ children, onPress, className }) => (
        <button data-testid="open-modal-button" className={className} onClick={onPress}>{children}</button>
    )
}));

describe('ParticipantSelector', () => {
    const participants = ['Alice', 'Bob', 'Charlie'];


    it('zeigt die Teilnehmerliste im Modal an', () => {
        render(<ParticipantSelector participants={participants} />);
        fireEvent.click(screen.getByTestId('open-modal-button'));
        fireEvent.click(screen.getByTestId('open-modal-button'));
        participants.forEach((participant) => {
            expect(screen.getByText(participant))
            expect(screen.getByRole('checkbox', { name: participant }))
        });
    });

    it('wählt Teilnehmer aus und speichert die Auswahl', () => {
        render(<ParticipantSelector participants={participants} />);

        fireEvent.click(screen.getByTestId('open-modal-button'));

        fireEvent.click(screen.getByRole('checkbox', { name: 'Alice' }));
        fireEvent.click(screen.getByRole('checkbox', { name: 'Charlie' }));


        expect(screen.getByRole('checkbox', { name: 'Alice' }))
        expect(!screen.getByRole('checkbox', { name: 'Bob' }))
        expect(screen.getByRole('checkbox', { name: 'Charlie' }))

        fireEvent.click(screen.getByText('Auswahl bestätigen'));

    });


});