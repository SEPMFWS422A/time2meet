'use client';

import {Button, Listbox, ListboxItem, ListboxSection, User,} from "@heroui/react";
import {StarIcon} from "lucide-react";
import React, {useEffect, useState} from "react";
import AddGroupModalContent from "@/lib/modalContents/AddGroupModalContent";
import ModalWindow from "@/components/ModalWindow";

// Definiere den Typ für eine Gruppe
export interface Group {
    _id: string;
    groupname: string;
    beschreibung: string;
    members: string[];
    isFavourite: boolean;
}

function Grouplist() {
    // Zustand für die Gruppen
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);

    // Gruppen von der API abrufen
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch("/api/groups");
                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error);
                }

                const sortedGroups = sortGroups(data.data);

                setGroups(sortedGroups);
            } catch (error: any) {
                setError("Fehler beim Abrufen der Gruppen: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handleNewGroup = (newGroup: Group) => {
        setGroups((prevGroups) => {
            // Neue Gruppe hinzufügen und dann sortieren
            const updatedGroups = [...prevGroups, newGroup];
            return sortGroups(updatedGroups);
        });
    };

    // Hilfsmethode zum Sortieren der Gruppen
    const sortGroups = (groups: Group[]): Group[] => {
        return groups.sort((a, b) => {
            // Zuerst nach isFavourite sortieren
            if (b.isFavourite === a.isFavourite) {
                // Wenn beide den gleichen Favoritenstatus haben, dann nach Gruppennamen sortieren
                return a.groupname.localeCompare(b.groupname);
            }
            return b.isFavourite ? 1 : -1; // Favoriten oben
        });
    };


    // Favoriten Status umschalten und an API senden
    const toggleFavourite = async (groupId: string) => {
        console.log("got here");
        try {
            const response = await fetch("/api/groups/favourite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({groupId}),
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            setGroups((prevGroups) => {
                const updatedGroups = prevGroups
                    .map((group) =>
                        group._id === groupId
                            ? {...group, isFavourite: data.isFavourite}
                            : group
                    );
                return sortGroups(updatedGroups);
            })
        } catch (error: any) {
            console.error("Fehler beim Umschalten des Favoriten-Status:", error);
        }
    };

    const closeAddGroupModal = () => {
        setIsAddGroupModalOpen(false);
    };

    const openAddGroupModal = () => {
        setIsAddGroupModalOpen(true);
    };

    return (
        <div className="flex flex-col items-center">
            <Button id="addGroup" color="primary" onPress={openAddGroupModal}>
                Neue Gruppe hinzufügen
            </Button>

            {loading && <p id="groupLoading">Lade Gruppen...</p>}
            {error && <p id="groupError" className="text-red-500">Fehler: {error}</p>}

            {!loading && !error && groups.length === 0 && (
                <p id="noGroups" className="text-gray-500 mt-4">Du bist noch in keiner Gruppe</p>
            )}

            {!loading && !error && groups.length > 0 && (
                <Listbox
                    id="groupList"
                    aria-label="Gruppen"
                    items={groups}
                    isVirtualized
                    onAction={(key) => console.log(`Selected group: ${key}`)}
                    virtualization={{maxListboxHeight: 400, itemHeight: 5}}
                >
                    <ListboxSection>
                        {groups.map((group) => (
                            <ListboxItem
                                key={group._id}
                                textValue={group.groupname}
                            >
                                <div id="groupListItem" className="flex gap-2 justify-between items-center">
                                    <User
                                        avatarProps={{size: "sm"}}
                                        description={`${group.members.length} Mitglieder`}
                                        name={group.groupname}
                                    />
                                    <Button
                                        variant="light"
                                        isIconOnly
                                        aria-label={"star_" + group.groupname}
                                        onPress={() => {
                                            toggleFavourite(group._id);
                                        }}
                                    >
                                        <StarIcon
                                            id="starIcon"
                                            fill={group.isFavourite ? "currentColor" : "none"}
                                        />
                                    </Button>
                                </div>
                            </ListboxItem>
                        ))}
                    </ListboxSection>
                </Listbox>
            )}

            {isAddGroupModalOpen && (
                <ModalWindow
                    isOpen={isAddGroupModalOpen}
                    onOpenChange={setIsAddGroupModalOpen}
                    title="Gruppe hinzufügen"
                    content={
                        <AddGroupModalContent
                            onClose={closeAddGroupModal}
                            onGroupCreated={handleNewGroup}
                        />
                    }
                />
            )}
        </div>
    );
}

export default Grouplist;
