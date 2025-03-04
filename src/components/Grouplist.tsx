import {
  Button,
  Listbox,
  ListboxItem,
  ListboxSection,
  User,
} from "@heroui/react";
import { StarIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
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
  const [isAddGroupModalOpen, setAddGroupModalOpen] = useState(false);

  // Gruppen von der API abrufen
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/groups");
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error);
        }

        const sortedGroups = data.data.sort(
          (a: Group, b: Group) =>
            (b.isFavourite ? 1 : 0) - (a.isFavourite ? 1 : 0)
        );

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
    setGroups((prevGroups) => [...prevGroups, newGroup]);
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
        body: JSON.stringify({ groupId }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      setGroups((prevGroups) =>
        prevGroups
          .map((group) =>
            group._id === groupId
              ? { ...group, isFavourite: data.isFavourite }
              : group
          )
          .sort((a, b) => (b.isFavourite ? 1 : 0) - (a.isFavourite ? 1 : 0))
      );

      /*
      setGroups((prevGroups) => {
        const updatedGroups = prevGroups.map((group) =>
          group._id === groupId
            ? { ...group, isFavourite: group.isFavourite }
            : group
        );

        console.log(updatedGroups);
        return [
          ...updatedGroups.filter((g) => g.isFavourite),
          ...updatedGroups.filter((g) => !g.isFavourite),
        ];
      });
      */
    } catch (error: any) {
      console.error("Fehler beim Umschalten des Favoriten-Status:", error);
    }
  };

  const closeAddGroupModal = () => {
    setAddGroupModalOpen(false);
  };

  const openAddGroupModal = () => {
    setAddGroupModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center">
      <Button color="primary" onPress={openAddGroupModal}>
        Neue Gruppe hinzufügen
      </Button>

      {loading && <p>Lade Gruppen...</p>}
      {error && <p className="text-red-500">Fehler: {error}</p>}

      {!loading && !error && groups.length === 0 && (
        <p className="text-gray-500 mt-4">Du bist noch in keiner Gruppe</p>
      )}

      {!loading && !error && groups.length > 0 && (
        <Listbox
          aria-label="Gruppen"
          items={groups}
          isVirtualized
          onAction={(key) => console.log(`Selected group: ${key}`)}
          virtualization={{ maxListboxHeight: 400, itemHeight: 5 }}
        >
          <ListboxSection>
            {groups.map((group) => (
              <ListboxItem key={group._id}>
                <div className="flex gap-2 justify-between items-center">
                  <User
                    avatarProps={{ size: "sm" }}
                    description={`${group.members.length} Mitglieder`}
                    name={group.groupname}
                  />
                  <Button
                    variant="light"
                    isIconOnly
                    aria-label="star"
                    onPress={(e) => {
                      //e.preventDefault();
                      toggleFavourite(group._id);
                    }}
                  >
                    <StarIcon
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
          onOpenChange={setAddGroupModalOpen}
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
