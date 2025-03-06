"use client";

import Calendar from "@/components/Calendar";
import { useState } from "react";
import ModalWindow from "@/components/ModalWindow";
import AddEventModalContent from "@/lib/modalContents/AddEventModalContent";
import EventInfoModalContent from "@/lib/modalContents/EventInfoModalContent";

export default function Home() {
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [isEventInfoModalOpen, setIsEventInfoModalOpen] = useState(false);
    const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false); // Neu: Bearbeitungsmodal
    const [modalData, setModalData] = useState(null);
    const [editModalData, setEditModalData] = useState(null); // Neu: Bearbeitungsdaten
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshEvents = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const deleteEvent = async (id: string) => {
        try {
            const response = await fetch(`/api/events/${id}`, { method: "DELETE" });
            if (!response.ok) {
                throw new Error("Fehler beim Löschen des Events.");
            }
            refreshEvents(); // Nach dem Löschen Events neu laden
            setIsEventInfoModalOpen(false); // Modal schließen
        } catch (error) {
            console.error("❌ Fehler beim Löschen des Events:", error);
        }
    };


    const openEditModal = (eventData: any) => {
        console.log("✏️ Bearbeiten gestartet für:", eventData);
        setEditModalData(eventData);
        setIsEditEventModalOpen(true);
    };

    return (
        <div>
            <Calendar
                key={refreshKey}
                onOpenDate={() => setIsAddEventModalOpen(true)}
                onOpenEvent={(events) => {
                    setModalData(events);
                    setIsEventInfoModalOpen(true);
                }}
            />

            {isAddEventModalOpen && (
                <ModalWindow
                    isOpen={isAddEventModalOpen}
                    onOpenChange={setIsAddEventModalOpen}
                    title="Event hinzufügen"
                    content={<AddEventModalContent onClose={() => setIsAddEventModalOpen(false)} refreshEvents={refreshEvents} />}
                />
            )}

            {isEventInfoModalOpen && modalData && (
                <ModalWindow
                    isOpen={isEventInfoModalOpen}
                    onOpenChange={setIsEventInfoModalOpen}
                    title="Event Informationen"
                    content={
                        <EventInfoModalContent
                            modalData={modalData}
                            onClose={() => setIsEventInfoModalOpen(false)}
                            onDelete={deleteEvent}
                            onEdit={openEditModal} // 👈 Öffnet das Bearbeitungsmodal statt direkt zu aktualisieren
                        />
                    }
                />
            )}

            {isEditEventModalOpen && editModalData && (
                <ModalWindow
                    isOpen={isEditEventModalOpen}
                    onOpenChange={setIsEditEventModalOpen}
                    title="Event bearbeiten"
                    content={
                        <AddEventModalContent
                            onClose={() => setIsEditEventModalOpen(false)}
                            refreshEvents={refreshEvents}
                            existingEvent={editModalData} // 👈 Event-Daten übergeben
                        />
                    }
                />
            )}
        </div>
    );
}
