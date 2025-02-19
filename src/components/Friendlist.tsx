import { Button, Listbox, ListboxItem, ListboxSection, User as UserAvatar } from "@heroui/react";
import { StarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddGroupModalContent from "@/lib/modalContents/AddGroupModalContent";
import ModalWindow from "@/components/ModalWindow";
import axios from "axios";

// Typdefinition für den Freund (gemäß der API)
export interface Friend {
  _id: string;
  vorname: string;
  name: string;
  benutzername: string;
  profilbild?: string;
  isFavourite?: boolean;
}

function Friendlist() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isAddGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const decodeToken = async () => {
      try {
        const res = await axios.get("/api/userauth/decode", { withCredentials: true });
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

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get(`/api/friends/${userId}`);
        if (res.data.success) {
          const friendsWithFav = res.data.data.map((friend: Friend) => ({
            ...friend,
            isFavourite: friend.isFavourite || false,
          }));
          friendsWithFav.sort((a: Friend, b: Friend) => Number(b.isFavourite) - Number(a.isFavourite));
          setFriends(friendsWithFav);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Freunde:", error);
      }
    };

    if (userId) {
      fetchFriends();
    }
  }, [userId]);

  const toggleFavourite = async (friend: Friend) => {
    const updatedFriend = { ...friend, isFavourite: !friend.isFavourite };
    setFriends((prev) => {
      const updatedFriends = prev.map((f) => (f._id === friend._id ? updatedFriend : f));
      updatedFriends.sort((a, b) => Number(b.isFavourite) - Number(a.isFavourite));
      return updatedFriends;
    });

    try {
      await axios.patch(
        `/api/friends/${userId}`,
        { friendId: friend._id, favourite: updatedFriend.isFavourite },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Favoritenstatus:", error);
    }
  };

  const closeAddGroupModal = () => setAddGroupModalOpen(false);
  const openAddGroupModal = () => setAddGroupModalOpen(true);

  return (
    <div className="flex flex-col items-center">
      <Button color="primary" onPress={openAddGroupModal}>
        Neuen Freund adden
      </Button>
      <Listbox
        aria-label="Freunde"
        items={friends}
        onAction={(key) => console.log(`Ausgewählter Freund: ${key}`)}
      >
        <ListboxSection>
          {friends.map((friend) => (
            <ListboxItem key={friend._id}>
              <div className="flex gap-2 justify-between items-center">
                <UserAvatar
                  avatarProps={{
                    size: "sm",
                    src: friend.profilbild || "https://via.placeholder.com/150",
                  }}
                  description={friend.benutzername}
                  name={friend.vorname}
                />
                <Button
                  variant="light"
                  isIconOnly
                  aria-label="star"
                  onPress={() => toggleFavourite(friend)}
                >
                  <StarIcon fill={friend.isFavourite ? "currentColor" : "none"} />
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
          title="Freunde hinzufügen"
          content={<AddGroupModalContent onClose={closeAddGroupModal} />}
        />
      )}
    </div>
  );
}

export default Friendlist;
