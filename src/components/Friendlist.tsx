import {Button, Listbox, ListboxItem, ListboxSection, User} from "@heroui/react";
import {StarIcon} from "lucide-react";
import React, {useState} from "react";
import AddGroupModalContent from "@/lib/modalContents/AddGroupModalContent";
import ModalWindow from "@/components/ModalWindow";
import {Member} from "@/components/Grouplist";

function Friendlist() {
    // Zustand für die Gruppen
    const [friends, setFriends] = useState<Member[]>([
        {
            firstName: "John",
            lastName: "Doe",
            username: "johndoe123",
            email: "johndoe123@example.com",
            phoneNumber: "+1-234-567-8901",
            bday: "1990-05-15",
            profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
            profilePrivacy: "Public",
            calendarPrivacy: "Private",
            theme: "light",
            role: "Admin",
            isFavourite: false,
            groups: []
        },
        {
            firstName: "Jane",
            lastName: "Smith",
            username: "janesmith45",
            email: "janesmith45@example.com",
            phoneNumber: "+1-234-567-8902",
            bday: "1992-08-22",
            profilePicture: "https://randomuser.me/api/portraits/women/2.jpg",
            profilePrivacy: "Private",
            calendarPrivacy: "Public",
            theme: "dark",
            role: "Member",
            isFavourite: false,
            groups: []
        },
        {
            firstName: "Michael",
            lastName: "Johnson",
            username: "mikejohnson78",
            email: "mikejohnson78@example.com",
            phoneNumber: "+1-234-567-8903",
            bday: "1985-12-30",
            profilePicture: "https://randomuser.me/api/portraits/men/3.jpg",
            profilePrivacy: "Public",
            calendarPrivacy: "Private",
            theme: "light",
            role: "Member",
            isFavourite: false,
            groups: []
        },
        {
            firstName: "Emma",
            lastName: "Davis",
            username: "emmadavis90",
            email: "emmadavis90@example.com",
            phoneNumber: "+1-234-567-8904",
            bday: "1994-03-11",
            profilePicture: "https://randomuser.me/api/portraits/women/4.jpg",
            profilePrivacy: "Private",
            calendarPrivacy: "Private",
            theme: "dark",
            role: "Admin",
            isFavourite: false,
            groups: []
        },
        {
            firstName: "Oliver",
            lastName: "Martinez",
            username: "olivermartinez56",
            email: "olivermartinez56@example.com",
            phoneNumber: "+1-234-567-8905",
            bday: "1991-07-07",
            profilePicture: "https://randomuser.me/api/portraits/men/4.jpg",
            profilePrivacy: "Public",
            calendarPrivacy: "Public",
            theme: "light",
            role: "Member",
            isFavourite: false,
            groups: []
        },
        {
            firstName: "Sophia",
            lastName: "Lopez",
            username: "sophialopez27",
            email: "sophialopez27@example.com",
            phoneNumber: "+1-234-567-8906",
            bday: "1993-01-20",
            profilePicture: "https://randomuser.me/api/portraits/women/5.jpg",
            profilePrivacy: "Private",
            calendarPrivacy: "Private",
            theme: "dark",
            role: "Admin",
            isFavourite: false,
            groups: []
        },
        {
            firstName: "Liam",
            lastName: "García",
            username: "liamgarcia33",
            email: "liamgarcia33@example.com",
            phoneNumber: "+1-234-567-8907",
            bday: "1995-04-17",
            profilePicture: "https://randomuser.me/api/portraits/men/5.jpg",
            profilePrivacy: "Public",
            calendarPrivacy: "Private",
            theme: "light",
            role: "Member",
            isFavourite: false,
            groups: []
        },
        {
            firstName: "Ava",
            lastName: "Wilson",
            username: "avawilson61",
            email: "avawilson61@example.com",
            phoneNumber: "+1-234-567-8908",
            bday: "1990-09-12",
            profilePicture: "https://randomuser.me/api/portraits/women/6.jpg",
            profilePrivacy: "Private",
            calendarPrivacy: "Public",
            theme: "dark",
            role: "Member",
            isFavourite: false,
            groups: []
        },
        {
            firstName: "Ethan",
            lastName: "Brown",
            username: "ethanbrown82",
            email: "ethanbrown82@example.com",
            phoneNumber: "+1-234-567-8909",
            bday: "1992-11-25",
            profilePicture: "https://randomuser.me/api/portraits/men/6.jpg",
            profilePrivacy: "Public",
            calendarPrivacy: "Private",
            theme: "light",
            role: "Admin",
            isFavourite: false,
            groups: []
        },
        {
            firstName: "Mia",
            lastName: "Taylor",
            username: "miataylor77",
            email: "miataylor77@example.com",
            phoneNumber: "+1-234-567-8910",
            bday: "1996-02-02",
            profilePicture: "https://randomuser.me/api/portraits/women/7.jpg",
            profilePrivacy: "Private",
            calendarPrivacy: "Public",
            theme: "dark",
            role: "Member",
            isFavourite: false,
            groups: []
        }
    ]);

    // Funktion zum Umschalten von "isFavourite"
    const toggleFavourite = (username: string) => {
        setFriends((prevFriends) => {
            const updatedFriends = prevFriends.map((friend) =>
                friend.username === username
                    ? {...friend, isFavourite: !friend.isFavourite} // Zustand ändern
                    : friend
            );

            // Sortiere das Array so, dass die favorisierten Freunde oben stehen
            return updatedFriends.sort((a, b) => (b.isFavourite ? 1 : 0) - (a.isFavourite ? 1 : 0));
        });
    };


    const [isAddGroupModalOpen, setAddGroupModalOpen] = useState(false);

    const closeAddGroupModal = () => {
        setAddGroupModalOpen(false);
    };

    const openAddGroupModal = () => {
        setAddGroupModalOpen(true);
    };

    return (
        <div className="flex flex-col items-center">
            <Button color="primary" onPress={openAddGroupModal}>
                Neuen Freund adden
            </Button>
            <Listbox
                aria-label="Gruppen"
                items={friends}
                onAction={(key) => console.log(`Ausgewählter Freund: ${key}`)}
                isVirtualized
                virtualization={{
                    maxListboxHeight: 872,
                    itemHeight: 5,
                }}
            >
                <ListboxSection>
                    {friends.map((item) => (
                        <ListboxItem key={item.firstName}>
                            <div className="flex gap-2 justify-between items-center">
                                <User avatarProps={{size: "sm", src: item.profilePicture}} description={item.username}
                                      name={item.firstName}/>
                                <Button
                                    variant="light"
                                    isIconOnly
                                    aria-label="star"
                                    onPress={() => toggleFavourite(item.username)} // Zustand ändern
                                >
                                    <StarIcon
                                        fill={item.isFavourite ? "currentColor" : "none"} // Dynamisches Füllen
                                    />
                                </Button>
                            </div>
                        </ListboxItem>
                    ))}
                </ListboxSection>
            </Listbox>

            {isAddGroupModalOpen && (
                <ModalWindow
                    isOpen={isAddGroupModalOpen}
                    onOpenChange={setAddGroupModalOpen}
                    title="Gruppe hinzufügen"
                    content={<AddGroupModalContent onClose={closeAddGroupModal}/>}
                />
            )}
        </div>
    );
}

export default Friendlist;
