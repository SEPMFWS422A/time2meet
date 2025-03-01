import { Button } from "@heroui/react";

interface EventInfoModalContentProps {
    modalData: {
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
}

const EventInfoModalContent: React.FC<EventInfoModalContentProps> = ({ modalData, onClose }) => {
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

    const { title, start, end, allDay, extendedProps } = modalData || {};
    const { description, location } = extendedProps || {};

    return (
        <div>
            <div id="EventInfoModal" className="px-6 py-4">
                <h2
                    id="eventInfoTitle"
                    className="text-xl font-semibold text-gray-800"
                >
                    {title || "Kein Titel"}
                </h2>
                <p
                    id="eventInfoTimePeriod"
                    className="mt-4 text-gray-700"
                >
                    <strong>Zeitraum:</strong>{" "}
                    {start || end
                        ? formatEventTime(start, end, allDay)
                        : "Keine Zeitangabe verfügbar"}
                </p>
                <div
                    id="eventInfoDescription"
                    className="mt-4 text-gray-700"
                >
                    <strong>Beschreibung: </strong>
                    <div className="break-words">
                        {description || "Keine Beschreibung verfügbar"}
                    </div>
                </div>
                <p
                    id="eventInfoLocation"
                    className="mt-2 text-sm text-gray-500"
                >
                    <strong>Ort:</strong> {location || "N/A"}
                </p>
            </div>
            <div className="flex justify-end px-6 py-4">
                <Button
                    color="danger"
                    variant="light"
                    onPress={onClose}
                    id="eventInfoCloseButton"
                >
                    Schließen
                </Button>
            </div>
        </div>
    );
};
    export default EventInfoModalContent;
