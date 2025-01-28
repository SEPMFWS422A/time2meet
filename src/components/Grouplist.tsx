import {Button, Listbox, ListboxItem, ListboxSection, User} from "@heroui/react";
import {StarIcon} from "lucide-react";
import {useState} from "react";

// Definiere den Typ für eine Gruppe
interface Group {
    groupName: string;
    description: string;
    isFavourite?: boolean; // Optional
    isRequired?: boolean;
}

function Grouplist() {
    // Zustand für die Gruppen
    const [groups, setGroups] = useState<Group[]>([
        {
            groupName: "Fußball-Gruppe",
            description: "Beschreibung Fußball",
            isFavourite: false,
        },
        {
            groupName: "Thailand-Gruppe",
            description: "Beschreibung Thailand",
            isFavourite: false,
        },
        {
            groupName: "Schminken-Gruppe",
            description: "Beschreibung Schminken",
            isFavourite: false,
        }
    ]);

    // Funktion zum Umschalten von "isFavourite"
    const toggleFavourite = (groupName: string) => {
        setGroups((prevGroups) => {
            const updatedGroups = prevGroups.map((group) =>
                group.groupName === groupName
                    ? {...group, isFavourite: !group.isFavourite} // Zustand ändern
                    : group
            );

            // Sortiere das Array so, dass die favorisierten Gruppen oben stehen
            return updatedGroups.sort((a, b) => (b.isFavourite ? 1 : 0) - (a.isFavourite ? 1 : 0));
        });
    };

    return (
        <div className="flex flex-col pt-2 items-center w-1/6 rounded-large border">
            <div>
                <Button variant="faded">
                    Neue Gruppe hinzufügen
                </Button>
            </div>
            <Listbox
                aria-label="Gruppen"
                items={groups}
                onAction={(key) => console.log(`Ausgewählte Gruppe: ${key}`)}
                isVirtualized
                virtualization={{
                    maxListboxHeight: 880,
                    itemHeight: 5,
                }}
            >
                <ListboxSection title="Gruppen">
                    {groups.map((item) => (
                        <ListboxItem key={item.groupName}>
                            <div className="flex gap-2 justify-between items-center">
                                <User avatarProps={{size: "sm"}} name={item.groupName}/>
                                <Button
                                    variant="light"
                                    isIconOnly
                                    aria-label="star"
                                    onPress={() => toggleFavourite(item.groupName)} // Zustand ändern
                                >
                                    <StarIcon
                                        fill={item.isFavourite ? "currentColor" : "none"} // Dynamisches Füllen
                                    />
                                </Button>
                            </div>
                        </ListboxItem>
                    ))}
                </ListboxSection>
            </Listbox>
        </div>
    );
}

export default Grouplist;
