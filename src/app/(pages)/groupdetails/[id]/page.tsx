import SurveyParticipationModal from "@/lib/modalContents/SurveyParticipationModal";

const groups = {
    '1': {
        name: 'Entwickler Gruppe',
        description: 'Eine Gruppe für Entwickler, die sich über Next.js austauschen.',
        members: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hannah', 'Igor', 'Jack'],
        surveys: [
            {
                title: "Welches Framework bevorzugst du?",
                description: "Wähle dein Lieblings-Framework aus.",
                options: ["React", "Vue", "Angular", "Svelte"],
            },
            {
                title: "Dark Mode oder Light Mode?",
                description: "Welche Darstellung nutzt du am liebsten?",
                options: ["Dark Mode", "Light Mode"],
            }
        ]
    },
    '2': {
        name: 'Designer Gruppe',
        description: 'Kreative Köpfe, die sich über UI/UX-Design unterhalten.',
        members: ['David', 'Eva', 'Frank', 'Leo', 'Mia', 'Nina', 'Oscar', 'Paul'],
        surveys: [
            {
                title: "Beste Farbpalette?",
                description: "Welche Farbpalette findest du am besten?",
                options: ["Blau/Weiß", "Schwarz/Gold", "Grün/Lila"],
            }
        ]
    }
};

export default function GroupPage({ params }) {
    console.log("Params erhalten:", params); // Debugging

    const group = groups[params.id];

    if (!group) {
        return <div className="text-center text-gray-600 mt-10">⚠️ Keine Gruppe gefunden ⚠️</div>;
    }

    return (
        <div className="flex">
            {/* 📌 Hauptinhalt links */}
            <div className="flex-1 max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
                <h1 className="text-2xl font-bold mb-2">{group.name}</h1>
                <p className="text-gray-700 mb-4">{group.description}</p>

                <h2 className="text-xl font-semibold mb-2">Umfragen</h2>
                <div className="space-y-6">
                    {group.surveys.map((survey, index) => (
                        <SurveyParticipationModal
                            key={index}
                            title={survey.title}
                            description={survey.description}
                            options={survey.options}
                        />
                    ))}
                </div>
            </div>

            {/* 📌 Fixierte Teilnehmerliste rechts mit Padding nach oben */}
            <aside className="fixed right-0 top-0 w-64 h-screen bg-gray-100 shadow-md p-4 pt-20 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-2">Teilnehmer</h2>
                <ul className="space-y-2">
                    {group.members.map((member, index) => (
                        <li key={index} className="p-2 bg-white shadow-sm rounded-md">
                            {member}
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    );
}

// **Generiere statische Seiten für alle Gruppen**
export async function generateStaticParams() {
    const paths = Object.keys(groups).map((id) => ({ id }));
    console.log("Generierte Pfade:", paths); // Debugging
    return paths;
}
