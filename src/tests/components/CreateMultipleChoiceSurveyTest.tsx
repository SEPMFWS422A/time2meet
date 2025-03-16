'use client';

import React, { useRef } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import CreateMultipleChoiceSurvey, {CreateMultipleChoiceSurveyRef} from "@/components/CreateMultipleChoiceSurvey";


// Mocke die heroui Komponenten
jest.mock('@heroui/react', () => ({
    ...jest.requireActual('@heroui/react'),
    Button: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
    Input: jest.fn(({ ...props }) => <input {...props} />),
    Dropdown: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    DropdownTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    DropdownMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    DropdownItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mocke lucide-react
jest.mock('lucide-react', () => ({
    LucidePlus: jest.fn(() => <span>+</span>),
    Trash2: jest.fn(() => <span>🗑️</span>),
}));

describe('CreateMultipleChoiceSurvey', () => {
    const mockOnSurveyData = jest.fn();

    it('renders correctly and handles input changes', () => {
        render(<CreateMultipleChoiceSurvey onSurveyData={mockOnSurveyData} />);

        const titleInput = screen.getByPlaceholderText('Titel der Umfrage angeben');
        const descriptionInput = screen.getByPlaceholderText('Beschreibung angeben');
        const locationInput = screen.getByPlaceholderText('Ort angeben');
        const optionInput = screen.getByPlaceholderText('Gib deinen Text ein');


        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
        fireEvent.change(locationInput, { target: { value: 'Test Location' } });
        fireEvent.change(optionInput, { target: { value: 'Test Option' } });

        expect(titleInput).eq('Test Title');
        expect(descriptionInput).eq('Test Description');
        expect(locationInput).eq('Test Location');
        expect(optionInput).eq('Test Option');

    });

    it('adds and deletes options correctly', () => {
        render(<CreateMultipleChoiceSurvey onSurveyData={mockOnSurveyData} />);

        const addButton = screen.getByLabelText('Option hinzufügen');
        fireEvent.click(addButton);

        const optionInputs = screen.getAllByPlaceholderText('Gib deinen Text ein');
        expect(optionInputs.length = 2)

        const deleteButtons = screen.getAllByRole('button', { name: /🗑️/i });
        fireEvent.click(deleteButtons[0]);

        const remainingOptionInputs = screen.getAllByPlaceholderText('Gib deinen Text ein');
        expect(remainingOptionInputs.length =1)
    });

    it('submits form data correctly', () => {
        render(<CreateMultipleChoiceSurvey onSurveyData={mockOnSurveyData} />);

        const titleInput = screen.getByPlaceholderText('Titel der Umfrage angeben');
        const descriptionInput = screen.getByPlaceholderText('Beschreibung angeben');
        const locationInput = screen.getByPlaceholderText('Ort angeben');
        const optionInput = screen.getByPlaceholderText('Gib deinen Text ein');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
        fireEvent.change(locationInput, { target: { value: 'Test Location' } });
        fireEvent.change(optionInput, { target: { value: 'Test Option' } });

        const ref = React.createRef<CreateMultipleChoiceSurveyRef>();
        render(<CreateMultipleChoiceSurvey ref={ref} onSurveyData={mockOnSurveyData} />);

        if (ref.current) {
            ref.current.submitForm();
        }

        expect(mockOnSurveyData.arguments = {
            title: 'Test Title',
            description: 'Test Description',
            location: 'Test Location',
            options: ['Test Option'],
            status: 'entwurf',
            participants: undefined,
        })
    });

    it('changes the status correctly', () => {
        render(<CreateMultipleChoiceSurvey onSurveyData={mockOnSurveyData} />);

        fireEvent.click(screen.getByText('Status: entwurf'));
        fireEvent.click(screen.getByText('Aktiv'));
        expect(screen.getByText('Status: aktiv'))

        fireEvent.click(screen.getByText('Status: aktiv'));
        fireEvent.click(screen.getByText('Geschlossen'));
        expect(screen.getByText('Status: geschlossen'))
    });
});