import {Button, Listbox, ListboxItem, ListboxSection, User} from "@heroui/react";
import {StarIcon} from "lucide-react";
import React, {useState} from "react";
import AddGroupModalContent from "@/lib/modalContents/AddGroupModalContent";
import ModalWindow from "@/components/ModalWindow";

// Definiere den Typ für eine Gruppe
export interface Group {
    groupName: string;
    description: string;
    members: Array<Member>;
    isFavourite: boolean;
}

export interface Member {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    bday: string;
    profilePicture: string;
    profilePrivacy: string;
    calendarPrivacy: string;
    theme: string;
    role: string;
    groups: Array<Group>;
}

function Grouplist() {
    // Zustand für die Gruppen
    const [groups, setGroups] = useState<Group[]>([
        {
            groupName: "Fußball-Gruppe",
            description: "Beschreibung Fußball",
            members: [],
            isFavourite: false,
        },
        {
            groupName: "Thailand-Gruppe",
            description: "Beschreibung Thailand",
            members: [],
            isFavourite: false,
        },
        {
            groupName: "Schminken-Gruppe",
            description: "Beschreibung Schminken",
            members: [],
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


    const [isAddGroupModalOpen, setAddGroupModalOpen] = useState(false);

    const closeAddGroupModal = () => {
        setAddGroupModalOpen(false);
    };

    const openAddGroupModal = () => {
        setAddGroupModalOpen(true);
    };

    return (
        <div className="flex flex-col pt-2 items-center w-1/6 rounded-large border">
            <div>
                <Button variant="faded" onPress={openAddGroupModal}>
                    Neue Gruppe hinzufügen
                </Button>
            </div>
            <Listbox
                aria-label="Gruppen"
                items={groups}
                onAction={(key) => console.log(`Ausgewählte Gruppe: ${key}`)}
                isVirtualized
                virtualization={{
                    maxListboxHeight: 872,
                    itemHeight: 5,
                }}
            >
                <ListboxSection title="Gruppen">
                    {groups.map((item) => (
                        <ListboxItem key={item.groupName}>
                            <div className="flex gap-2 justify-between items-center">
                                <User avatarProps={{size: "sm"}} description={item.members.length + ' Mitglieder'} name={item.groupName}/>
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

            {isAddGroupModalOpen && (
                <ModalWindow
                    isOpen={isAddGroupModalOpen}
                    onOpenChange={setAddGroupModalOpen}
                    title="Gruppe hinzufügen"
                    content={<AddGroupModalContent onClose={closeAddGroupModal}/>}
                />
            )}
        </div>
    );
}

export default Grouplist;
