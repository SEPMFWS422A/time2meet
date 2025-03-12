import { IFriend } from "@/lib/interfaces/IFriend";

export default async function fetchAllFriends(userId: string) {
    try {
        return await fetch(`/api/friends/${userId}`)
            .then((res) => res.json())
            .then((data: { data: IFriend[], success: boolean }) => {
                if (data.success) {
                    const friendsWithFav: IFriend[] = data.data.map((friend: IFriend) => ({
                        ...friend,
                        isFavourite: friend.isFavourite || false,
                    }));
                    friendsWithFav.sort((a: IFriend, b: IFriend) => Number(b.isFavourite) - Number(a.isFavourite));
                    return friendsWithFav;
                }
                return null;
            });
    } catch (err) {
        if (err instanceof Error) console.error(err);
    }

}

