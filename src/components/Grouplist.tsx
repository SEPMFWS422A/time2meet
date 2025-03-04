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
  description: string;
  members: string[];
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
  isFavourite: boolean;
  groups: Array<Group>;
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
        setGroups(data.data);
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

      setGroups((prevGroups) => {
        const updatedGroups = prevGroups.map((group) =>
          group._id === groupId
            ? { ...group, isFavourite: group.isFavourite }
            : group
        );
        return [
          ...updatedGroups.filter((g) => g.isFavourite),
          ...updatedGroups.filter((g) => !g.isFavourite),
        ];
      });
    } catch (error: any) {
      console.error("Fehler beim Umschalten des Favoriten-Status:", error);
    }
    /*
    setGroups((prevGroups) => {
      const updatedGroups = prevGroups.map((group) =>
        group.groupName === groupName
          ? { ...group, isFavourite: !group.isFavourite } // Zustand ändern
          : group
      );

      // Sortiere das Array so, dass die favorisierten Gruppen oben stehen
      return updatedGroups.sort(
        (a, b) => (b.isFavourite ? 1 : 0) - (a.isFavourite ? 1 : 0)
      );
    });
    */
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
                    aria-label="Favorit"
                    onPress={() => toggleFavourite(group._id)}
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

  /*
  return (
    <div className="flex flex-col items-center">
      <Button color="primary" onPress={openAddGroupModal}>
        Neue Gruppe hinzufügen
      </Button>
      <Listbox
        aria-label="Gruppen"
        items={groups}
        onAction={(key) => console.log(`Ausgewählte Gruppe: ${key}`)}
        isVirtualized
        virtualization={{
          maxListboxHeight: 400,
          itemHeight: 5,
        }}
      >
        <ListboxSection>
          {groups.map((item) => (
            <ListboxItem key={item.groupName}>
              <div className="flex gap-2 justify-between items-center">
                <User
                  avatarProps={{ size: "sm" }}
                  description={item.members.length + " Mitglieder"}
                  name={item.groupName}
                />
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
          content={<AddGroupModalContent onClose={closeAddGroupModal} />}
        />
      )}
    </div>
  );
  */
}

export default Grouplist;
