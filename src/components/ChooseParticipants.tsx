'use client';

import { useState, useEffect } from 'react';

export default function ParticipantSelector() {
    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);

    useEffect(() => {
        // Lade die Teilnehmerliste aus der JSON-Datei
        fetch('/participants.json')
            .then((response) => response.json())
            .then((data) => setParticipants(data));
    }, []);

    const handleParticipantChange = (event) => {
        const selectedId = parseInt(event.target.value);
        const participant = participants.find((p) => p.id === selectedId);
        setSelectedParticipant(participant);
    };

    return (
        <div>
            <h1>Umfrage-Teilnehmer auswählen</h1>
            <select value={selectedParticipant?.id || ''} onChange={handleParticipantChange}>
                <option value="">Teilnehmer auswählen</option>
                {participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                        {participant.name}
                    </option>
                ))}
            </select>
            {selectedParticipant && (
                <p>Ausgewählter Teilnehmer: {selectedParticipant.name}</p>
            )}
        </div>
    );
}