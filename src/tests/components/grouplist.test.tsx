/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Grouplist from "@/components/Grouplist";
import { expect } from "@jest/globals";

// Mock für die fetch-API
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [] }),
    })
) as jest.Mock;

// Mocke die heroui Komponenten
jest.mock('@heroui/react', () => ({
    ...jest.requireActual('@heroui/react'), // Behalte den Rest der Bibliothek unverändert
    Button: jest.fn(({ children, onPress, ...props }) => (
        <button onClick={onPress} {...props}>
            {children}
        </button>
    )),
    Listbox: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    ListboxItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    ListboxSection: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    User: jest.fn(({ name, description, avatarProps, ...props }) => (
        <div {...props}>
            <div>{name}</div>
            <div>{description}</div>
            {avatarProps && <img {...avatarProps} />} {/* Mock für avatarProps */}
        </div>
    )),
}));

// Mocke lucide-react
jest.mock('lucide-react', () => ({
    StarIcon: jest.fn(({ fill, ...props }) => (
        <svg {...props}>
            <path fill={fill} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    )),
}));

// Mocke AddGroupModalContent
jest.mock('@/lib/modalContents/AddGroupModalContent', () => ({
    __esModule: true,
    default: jest.fn(({ onClose, onGroupCreated }) => (
        <div data-testid="add-group-modal">
            <input data-testid="groupname-input" placeholder="Gruppenname" />
            <input data-testid="description-input" placeholder="Beschreibung" />
            <button
                data-testid="confirm-button"
                onClick={() =>
                    onGroupCreated({
                        _id: "123",
                        groupname: "Neue Gruppe",
                        beschreibung: "Beschreibung der neuen Gruppe",
                        members: [],
                        isFavourite: false,
                    })
                }
            >
                Bestätigen
            </button>
            <button onClick={onClose}>Schließen</button>
        </div>
    )),
}));

// Mocke ModalWindow
jest.mock('@/components/ModalWindow', () => ({
    __esModule: true,
    default: jest.fn(({ isOpen, onOpenChange, title, content }) => (
        <div data-testid="modal">
            {isOpen && (
                <div>
                    <h2>{title}</h2>
                    {content}
                </div>
            )}
        </div>
    )),
}));

describe("Grouplist Component", () => {
    const mockGroups = [
        {
            _id: "1",
            groupname: "Gruppe 1",
            beschreibung: "Beschreibung 1",
            members: ["Mitglied 1"],
            isFavourite: false,
        },
        {
            _id: "2",
            groupname: "Gruppe 2",
            beschreibung: "Beschreibung 2",
            members: ["Mitglied 2"],
            isFavourite: true,
        },
    ];

    beforeEach(() => {
        // Mock für fetch-Gruppen
        (global.fetch as jest.Mock).mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve({ success: true, data: mockGroups }),
            })
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test 1: Initiales Laden der Gruppenliste
    it("should load and display groups", async () => {
        render(<Grouplist />);

        // Ladezustand anzeigen
        expect(screen.getByText("Lade Gruppen...")).toBeInTheDocument();

        // Warte auf das Laden der Gruppen
        await waitFor(() => {
            expect(screen.getByText("Gruppe 1")).toBeInTheDocument();
            expect(screen.getByText("Gruppe 2")).toBeInTheDocument();
        });
    });

    // Test 2: Öffnen des Modals zum Hinzufügen einer neuen Gruppe
    it("should open the modal when 'Neue Gruppe hinzufügen' button is clicked", async () => {
        render(<Grouplist />);

        // Klicke auf den Button, um das Modal zu öffnen
        fireEvent.click(screen.getByText("Neue Gruppe hinzufügen"));

        // Überprüfe, ob das Modal geöffnet ist
        expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    // Test 3: Hinzufügen einer neuen Gruppe
    it("should add a new group to the list", async () => {
        render(<Grouplist />);

        // 1. Öffne das Modal
        fireEvent.click(screen.getByText("Neue Gruppe hinzufügen"));
        expect(screen.getByTestId("modal")).toBeInTheDocument();

        // 2. Trage den Gruppennamen und die Beschreibung ein
        const groupnameInput = screen.getByTestId("groupname-input");
        const descriptionInput = screen.getByTestId("description-input");

        fireEvent.change(groupnameInput, { target: { value: "Neue Gruppe" } });
        fireEvent.change(descriptionInput, { target: { value: "Beschreibung der neuen Gruppe" } });

        // 3. Klicke auf den Bestätigen-Button, um die Gruppe zu erstellen
        fireEvent.click(screen.getByTestId("confirm-button"));

        // 4. Überprüfe, ob die neue Gruppe in der Liste angezeigt wird
        await waitFor(() => {
            expect(screen.getByText("Neue Gruppe")).toBeInTheDocument();
            expect(screen.getByText("Beschreibung der neuen Gruppe")).toBeInTheDocument();
        });
    });

    // Test 4: Favorisieren einer Gruppe
    it("should toggle the favourite status of a group", async () => {
        // Mock für die Favoriten-API
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve({ success: true, isFavourite: true }),
            })
        );

        render(<Grouplist />);

        // Warte auf das Laden der Gruppen
        await waitFor(() => {
            expect(screen.getByText("Gruppe 1")).toBeInTheDocument();
        });

        // Klicke auf den Stern-Button, um die Gruppe zu favorisieren
        fireEvent.click(screen.getByLabelText("star_Gruppe 1"));

        // Überprüfe, ob die Gruppe als Favorit markiert wurde
        await waitFor(() => {
            expect(screen.getByLabelText("star_Gruppe 1").querySelector("svg")).toHaveAttribute(
                "fill",
                "currentColor"
            );
        });
    });

    // Test 5: Fehler beim Laden der Gruppen
    it("should display an error message if fetching groups fails", async () => {
        // Mock für einen Fehler beim Laden der Gruppen
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.reject(new Error("Fehler beim Abrufen der Gruppen"))
        );

        render(<Grouplist />);

        // Warte auf die Fehlermeldung
        await waitFor(() => {
            expect(screen.getByText("Fehler: Fehler beim Abrufen der Gruppen")).toBeInTheDocument();
        });
    });

    // Test 6: Keine Gruppen vorhanden
    it("should display a message if no groups are available", async () => {
        // Mock für eine leere Gruppenliste
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve({ success: true, data: [] }),
            })
        );

        render(<Grouplist />);

        // Warte auf die Nachricht, dass keine Gruppen vorhanden sind
        await waitFor(() => {
            expect(screen.getByText("Du bist noch in keiner Gruppe")).toBeInTheDocument();
        });
    });
});