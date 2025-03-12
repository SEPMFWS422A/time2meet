import React, {useState} from "react";
import {Button, Input} from "@heroui/react";
import postGroup from "@/lib/api_methods/Groups/postGroup/postGroup";
import {IGroup} from "@/lib/interfaces/IGroup";

interface AddGroupModalContentProps {
    onClose: () => void;
    onGroupCreated: (newgroup: IGroup) => void;
}

const AddGroupModalContent: React.FC<AddGroupModalContentProps> = ({
                                                                       onClose,
                                                                       onGroupCreated,
                                                                   }) => {
    const [groupname, setGroupname] = useState("");
    const [beschreibung, setBeschreibung] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateGroup = async (groupname: string, beschreibung: string) => {
        if (!groupname) setError("Sie müssen einen Gruppennamen angeben.");

        const savedGroup = await postGroup(groupname, beschreibung);

        if (!savedGroup) {
            setLoading(false);
        } else if (savedGroup) {
            setLoading(false);
            onGroupCreated(savedGroup);
            onClose();
        } else {
            setError("Es ist ein Fehler aufgetreten");
        }

    }

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
                <Button id="closeButtonAddGroupModal" color="danger" variant="light" onPress={onClose}>
                    Schließen
                </Button>
                <Button id="createGroupButtonAddGroupModal" color="primary"
                        onPress={() => handleCreateGroup(groupname, beschreibung)} disabled={loading}>
                    Gruppe erstellen
                </Button>
            </div>
        </div>
    );
};

export default AddGroupModalContent;
