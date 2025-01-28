import {Avatar, Listbox, ListboxItem} from "@heroui/react";

function Grouplist() {
    const groups = [
        {
            groupName: "Fußball-Gruppe",
            description: "Beschreibung Fußball",
        },
        {
            groupName: "Thailand-Gruppe",
            description: "Beschreibung Thailand",
        },
        {
            groupName: "Schminken-Gruppe",
            description: "Beschreibung Schminken",
        },
        {
            groupName: "Sauf-Gruppe",
            description: "Beschreibung Saufen",
        },
    ];

    return (
        <Listbox aria-label="Gruppen" variant="flat" items={groups} onAction={(key) => console.log(key)}>
            {(item) => (
                <ListboxItem
                    showDivider
                    key={item.groupName}
                >
                    <div className="flex gap-2 items-center">
                        <Avatar alt={item.groupName} size="sm"/>
                        <div className="">
                            <span>{item.groupName}</span>
                        </div>
                    </div>
                </ListboxItem>
            )}

        </Listbox>
    );
}

export default Grouplist;