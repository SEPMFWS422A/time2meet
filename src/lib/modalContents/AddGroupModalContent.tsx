import React, { useState } from "react";
import { Button, Form, Input } from "@heroui/react";

interface AddGroupModalContentProps {
  onClose: () => void;
  onGroupCreated: (newgroup: any) => void;
}

const AddGroupModalContent: React.FC<AddGroupModalContentProps> = ({
  onClose,
  onGroupCreated,
}) => {
  const [groupname, setGroupname] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGroup = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupname, beschreibung }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      onGroupCreated(data.data);
      onClose();
    } catch (error: any) {
      setError("Fehler beim Erstellen der Gruppe: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Gruppenname"
        variant="bordered"
        value={groupname}
        onChange={(e) => setGroupname(e.target.value)}
        placeholder="Gib den Namen der Gruppe ein"
        isRequired
      />
      <Input
        label="Beschreibung"
        variant="bordered"
        value={beschreibung}
        onChange={(e) => setBeschreibung(e.target.value)}
        placeholder="Gib eine Beschreibung ein"
      />
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex justify-end gap-3">
        <Button color="danger" variant="light" onPress={onClose}>
          Schließen
        </Button>
        <Button color="primary" onPress={handleCreateGroup} disabled={loading}>
          Gruppe erstellen
        </Button>
      </div>
    </div>
  );

  /*
interface Group {
    groupName: string;
    description: string;
    members: string[];
    isFavourite: boolean;
}

interface AddGroupModalContentProps {
    onClose: () => void;
}

const AddGroupModalContent: React.FC<AddGroupModalContentProps> = ({ onClose }) => {
    const [group, setGroup] = useState<Group>({
        groupName: "",
        description: "",
        members: [],
        isFavourite: false,
    });

    const handleInputChange = (field: keyof Group, value: string) => {
        setGroup((prevGroup) => ({
            ...prevGroup,
            [field]: value,
        }));
    };

    // const handleSaveGroup = () => {
    //     if (group.groupName.trim() && group.description.trim()) {
    //         onAddGroup(group);
    //         setGroup({ groupName: "", description: "", members: [], isFavourite: false }); // Formular zurücksetzen
    //         onClose();
    //     } else {
    //         alert("Bitte füllen Sie alle erforderlichen Felder aus.");
    //     }
    // };
    */

  /*
    return (
        <div>
            <Form id="addEventForm" className="p-4 space-y-3" validationBehavior="native">
                <Input
                    label="Gruppenname"
                    isRequired
                    placeholder="Geben Sie den Namen der Gruppe ein."
                    variant="bordered"
                    value={group.groupName}
                    onChange={(e) => handleInputChange("groupName", e.target.value)}
                />
                <Input
                    label="Beschreibung"
                    placeholder="Geben Sie eine Beschreibung ein."
                    variant="bordered"
                    value={group.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                />
                <div className="flex justify-end gap-3">
                    <Button color="danger" variant="light" onPress={onClose}>
                        Schließen
                    </Button>
                    <Button color="primary" onPress={onClose}>
                        Gruppe speichern
                    </Button>
                </div>
            </Form>
        </div>
    );
    */
};

export default AddGroupModalContent;
