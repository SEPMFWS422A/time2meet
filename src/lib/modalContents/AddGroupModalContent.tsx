import React, { useState } from "react";
import { Button, Form, Input } from "@heroui/react";

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
        firstName: "",
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
};

export default AddGroupModalContent;
