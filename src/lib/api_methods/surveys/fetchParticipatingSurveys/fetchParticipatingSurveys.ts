import { Survey } from "@/lib/interfaces/Survey";

export default async function fetchParticipatingSurveys() {
    try {
        return await fetch("/api/surveys/participating")
            .then((res) => res.ok ? res.json() : null)
            .then((data: Survey[] | null) => data);
    } catch (err) {
        if (err instanceof Error) console.error(err);
    }
}