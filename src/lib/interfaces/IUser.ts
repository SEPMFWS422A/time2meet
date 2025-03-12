export interface IUser {
    _id: string;
    name: string;
    vorname: string;
    email: string;
    benutzername: string;
    password: string;
    telefonnummer: string;
    geburtsdatum: Date;
    freunde: [
        {
            friendId: string;
            favourite: string;
        }
    ],
    profilsichtbarkeit: "öffentlich" | "Privat" | "Nur freunde";
    kalendersichtbarkeit: "öffentlich" | "Privat" | "Nur freunde",
    theme: "Hell" | "dunkel";
    profilbild: string;
    favouriteGroups: string;
    createdAt: Date;
}