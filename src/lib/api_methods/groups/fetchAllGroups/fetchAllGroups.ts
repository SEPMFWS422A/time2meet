import {IGroup} from "@/lib/interfaces/IGroup";

export default async function fetchAllGroups() {
    try {
        return await fetch("/api/groups")
            .then(res => res.json())
            .then((data: { success: boolean, data: IGroup[] }) => data.success ? data.data : null);
    } catch (err) {
        if (err instanceof Error) console.error(err);
        return [];
    }
}