'use client';

import {Button, Listbox, ListboxItem, ListboxSection, User as UserAvatar} from "@heroui/react";
import {StarIcon, XIcon} from "lucide-react";
import React, {useEffect, useState} from "react";
import AddFriendModalContent from "@/lib/modalContents/AddFriendModalContent";
import ModalWindow from "@/components/ModalWindow";
import axios from "axios";
import fetchAllFriends from "@/lib/api_methods/friends/fetchFriends/fetchFriends";

// Typdefinition für den Freund (gemäß der API)
export interface Friend {
    _id: string;
    vorname: string;
    name: string;
    benutzername: string;
    profilbild?: string;
    isFavourite?: boolean;
}

interface Notification {
    message: string;
    type: "success" | "error";
}

function Friendlist() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
    const [userId, setUserId] = useState<string>("");
    const [notification, setNotification] = useState<Notification | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const decodeToken = async () => {
            try {
                const res = await axios.get("/api/userauth/decode", {withCredentials: true});
                if (res.data.id) {
                    setUserId(res.data.id);
                } else {
                    console.error("Token not found on server:", res.data);
                }
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        };
        decodeToken();
    }, []);

    const fetchFriends = async () => {
        setIsLoading(true);
        fetchAllFriends(userId)
            .then((friendList) => {
                if (friendList && friendList.length > 0) {
                    setFriends(friendList)
                } else if (friendList && friendList.length === 0) {
                    setError("Du hast noch keine Freunde");
                } else {
                    setError("Freunde konnten nicht geladen werden.")
                }
            })
    }

    useEffect(() => {
        if (userId) {
            fetchFriends().then(() => setIsLoading(false));
        }
    }, [userId]);

    const toggleFavourite = async (friend: Friend) => {
        const updatedFriend = {...friend, isFavourite: !friend.isFavourite};
        setFriends((prev) => {
            const updatedFriends = prev.map((f) => (f._id === friend._id ? updatedFriend : f));
            updatedFriends.sort((a, b) => Number(b.isFavourite) - Number(a.isFavourite));
            return updatedFriends;
        });

        try {
            await axios.patch(
                `/api/friends/${userId}`,
                {friendId: friend._id, favourite: updatedFriend.isFavourite},
                {withCredentials: true}
            );
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Favoritenstatus:", error);
        }
    };

    const removeFriend = async (friend: Friend) => {
        if (confirm(`Möchtest du "${friend.vorname} ${friend.name}" wirklich aus deiner Freundesliste entfernen?`)) {
            try {
                const response = await axios.delete(`/api/friends/remove`, {
                    data: {friendId: friend._id},
                    withCredentials: true,
                });

                if (response.data.success) {
                    // Entferne den Freund aus dem lokalen State
                    setFriends((prev) => prev.filter((f) => f._id !== friend._id));
                    // Setze eine benutzerdefinierte Notification
                    setNotification({
                        message: "Freund erfolgreich entfernt!",
                        type: "success",
                    });
                }
            } catch (error) {
                console.error("Fehler beim Entfernen des Freundes:", error);
                setNotification({
                    message: "Fehler beim Entfernen des Freundes",
                    type: "error",
                });
            }
        }
    };

    // Notification automatisch nach 3 Sekunden ausblenden
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const closeAddFriendModal = () => setIsAddFriendModalOpen(false);
    const openAddFriendModal = () => setIsAddFriendModalOpen(true);

    // Wird aufgerufen, wenn ein Freund erfolgreich hinzugefügt wurde
    const handleAddFriendSuccess = () => {
        fetchFriends(); // Aktualisiere die Freundesliste
    };

    return (
        <div className="flex flex-col items-center">
            {notification && (
                <div
                    className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow z-50">
                    {notification.message}
                </div>
            )}
            {error && <p id="groupError" className="text-red-500">Fehler: {error}</p>}

            <Button color="primary" onPress={openAddFriendModal}>
                Neuen Freund adden
            </Button>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-4">
                    <p>Lade Freunde...</p>
                </div>
            ) : (
                <Listbox
                    aria-label="Freunde"
                    items={friends}

                >
                    <ListboxSection>
                        {friends.map((friend) => (
                            <ListboxItem
                                key={friend._id}
                                textValue={`${friend.vorname} ${friend.name}`}
                            >
                                <div className="flex gap-2 justify-between items-center">
                                    <UserAvatar
                                        avatarProps={{
                                            size: "sm",
                                            src: friend.profilbild,
                                        }}
                                        description={friend.benutzername}
                                        name={friend.vorname}
                                    />
                                    <div className="flex gap-1">
                                        <Button
                                            variant="light"
                                            isIconOnly
                                            aria-label="star"
                                            onPress={() => toggleFavourite(friend)}
                                        >
                                            <StarIcon fill={friend.isFavourite ? "currentColor" : "none"}/>
                                        </Button>
                                        <Button
                                            variant="light"
                                            isIconOnly
                                            aria-label="remove friend"
                                            onPress={() => removeFriend(friend)}
                                            className="text-red-500"
                                        >
                                            <XIcon size={16}/>
                                        </Button>
                                    </div>
                                </div>
                            </ListboxItem>
                        ))}
                    </ListboxSection>
                </Listbox>
            )}

            {isAddFriendModalOpen && (
                <ModalWindow
                    isOpen={isAddFriendModalOpen}
                    onOpenChange={setIsAddFriendModalOpen}
                    title="Freunde hinzufügen"
                    content={
                        <AddFriendModalContent
                            onClose={closeAddFriendModal}
                            onAddSuccess={handleAddFriendSuccess}
                        />
                    }
                />
            )}
        </div>
    );
}

export default Friendlist;
