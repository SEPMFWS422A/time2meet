export interface IGroup {
    _id: string;
    groupname: string;
    beschreibung: string;
    creator: string;
    admins: string[];
    members: string[];
    createdAt: Date;
    isFavourite: boolean;
}