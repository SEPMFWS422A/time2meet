import { Button } from "@heroui/react";

interface EventInfoModalContentProps {
    modalData: {
        id?: string; // Event-ID für API-Aufrufe hinzufügen
        title: string;
        start: string;
        end: string;
        allDay: boolean;
        extendedProps: {
            description: string;
            location: string;
        };
    };
    onClose: () => void;
    onDelete: (id: string) => void; // Funktion zum Löschen
    onEdit: (modalData: any) => void; // Funktion zum Bearbeiten
}

const EventInfoModalContent: React.FC<EventInfoModalContentProps> = ({ modalData, onClose, onDelete, onEdit }) => {
    const formatEventTime = (start: string, end: string, allDay: boolean) => {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (allDay) {
            return `${startDate.toLocaleDateString()} (Ganztägig)`;
        }

        const formatTime = (date: Date) =>
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const startDateFormatted = startDate.toLocaleDateString();
        const endDateFormatted = endDate.toLocaleDateString();

        if (startDateFormatted === endDateFormatted) {
            return `${startDateFormatted} von ${formatTime(startDate)} bis ${formatTime(endDate)}`;
        } else {
            return `Von ${startDateFormatted} um ${formatTime(startDate)} bis ${endDateFormatted} um ${formatTime(endDate)}`;
        }
    };

    const { id, title, start, end, allDay, extendedProps } = modalData || {};
    const { description, location } = extendedProps || {};

    return (
        <div>
            <div id="EventInfoModal" className="px-6 py-4">
                <h2 id="eventInfoTitle" className="text-xl font-semibold text-gray-800">
                    {title || "Kein Titel"}
                </h2>
                <p id="eventInfoTimePeriod" className="mt-4 text-gray-700">
                    <strong>Zeitraum:</strong>{" "}
                    {start || end ? formatEventTime(start, end, allDay) : "Keine Zeitangabe verfügbar"}
                </p>
                <div id="eventInfoDescription" className="mt-4 text-gray-700">
                    <strong>Beschreibung: </strong>
                    <div className="break-words">{description || "Keine Beschreibung verfügbar"}</div>
                </div>
                <p id="eventInfoLocation" className="mt-2 text-sm text-gray-500">
                    <strong>Ort:</strong> {location || "N/A"}
                </p>
            </div>
            <div className="flex justify-between px-6 py-4">
                <Button color="warning" variant="light" onPress={() => {
                    console.log("✏️ Bearbeiten wurde geklickt:", modalData);
                    onEdit(modalData); // Hier Modal in den Bearbeitungsmodus versetzen
                }}>
                    Bearbeiten
                </Button>


                <Button color="danger" variant="light" onPress={() => {
                    if (id) {
                        console.log("🗑 Löschen wurde geklickt. ID:", id);
                        onDelete(id);
                    } else {
                        console.error("❌ Kein Event-ID zum Löschen vorhanden!");
                    }
                }}>
                    Löschen
                </Button>

                <Button color="default" variant="light" onPress={onClose}>
                    Schließen
                </Button>
            </div>
        </div>
    );
};

export default EventInfoModalContent;
