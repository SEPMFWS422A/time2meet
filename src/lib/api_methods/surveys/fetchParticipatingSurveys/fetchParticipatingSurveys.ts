import { ISurvey } from "@/lib/interfaces/ISurvey";

export default async function fetchParticipatingSurveys() {
    try {
        return await fetch("/api/surveys/participating")
            .then((res) => res.ok ? res.json() : null)
            .then((data: ISurvey[] | null) => data);
    } catch (err) {
        if (err instanceof Error) console.error(err);
    }
}