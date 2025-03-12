import {IGroup} from "@/lib/interfaces/IGroup";

export default async function postGroup(groupname: string, beschreibung: string) {
    try {
        return await fetch("/api/groups", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                groupname: groupname, beschreibung: beschreibung
            })
        })
            .then(res => res.json())
            .then((data: { success: boolean, data: IGroup }) => data.success ? data.data : null);
    } catch (err) {
        if (err instanceof Error) console.error(err);
    }
}