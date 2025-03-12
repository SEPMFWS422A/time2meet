import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Avatar, Spinner } from "@heroui/react";
import axios from "axios";

interface User {
  _id: string;
  vorname: string;
  name: string;
  benutzername: string;
  email: string;
  profilbild?: string;
  isCurrentUser?: boolean;
  isFriend?: boolean;
}

interface AddFriendModalContentProps {
  onClose: () => void;
  onAddSuccess?: (user: User) => void;
}

interface Notification {
  message: string;
  type: "success" | "error";
}

const AddFriendModalContent: React.FC<AddFriendModalContentProps> = ({
  onClose,
  onAddSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<Notification | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [searchResults, searchTerm]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `/api/friends/search?query=${encodeURIComponent(searchTerm)}`
      );
      if (response.data.success) {
        setSearchResults(response.data.data || []);
      } else {
        setError(response.data.error || "Fehler bei der Suche");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Konnte keine Benutzer finden");
      console.error("Suchfehler:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async (user: User) => {
    setError("");
    setNotification(null);
    setIsAddingFriend(true);
    try {
      const response = await axios.post(
        "/api/friends/add",
        { friendId: user._id },
        { withCredentials: true }
      );
      if (response.data.success) {
        setNotification({
          message: "Freund erfolgreich hinzugefügt!",
          type: "success",
        });
        setSearchResults((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, isFriend: true } : u
          )
        );
        if (onAddSuccess) {
          onAddSuccess(user);
        }
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Konnte Freund nicht hinzufügen";
      setError(errorMessage);
      console.error("Fehler beim Hinzufügen:", err);
    } finally {
      setIsAddingFriend(false);
    }
  };

  const renderAction = (user: User) => {
    if (user.isCurrentUser) {
      return <span className="text-gray-500 italic">Das bist du</span>;
    }
    if (user.isFriend) {
      return <span className="text-green-600">Bereits befreundet</span>;
    }
    return (
      <Button
        color="primary"
        onPress={() => handleAddFriend(user)}
        isLoading={isAddingFriend}
        isDisabled={isAddingFriend}
        size="sm"
      >
        Hinzufügen
      </Button>
    );
  };

  return (
    <div className="p-4 w-full relative">
      <h3 className="text-lg font-bold mb-4">Freunde finden</h3>
      <Input
        ref={inputRef}
        label="Freundessuche"
        placeholder="Gib Username oder E-Mail ein (mind. 2 Zeichen)"
        variant="bordered"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        isDisabled={isLoading || isAddingFriend}
        className="mb-3"
        autoFocus
      />
      {/* Notification oben rechts auf der kompletten Seite */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow z-50">
          {notification.message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {searchResults.length === 0 &&
            searchTerm.trim().length >= 2 && !isLoading && (
              <p className="text-gray-500 text-center py-4">
                Keine Benutzer gefunden.
              </p>
            )}
          {searchResults.map((user) => (
            <div key={user._id} className="mb-2 border-b pb-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <Avatar
                    src={
                      user.profilbild ??
                      "https://via.placeholder.com/150"
                    }
                    alt={`${user.vorname} {user.name}`}
                    className="mr-2"
                  />
                  <div>
                    <p className="font-medium">
                      {user.vorname} {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      @{user.benutzername}
                    </p>
                  </div>
                </div>
                <div className="ml-2">{renderAction(user)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
        <Button
          color="danger"
          variant="light"
          onPress={onClose}
          isDisabled={isAddingFriend}
        >
          Schließen
        </Button>
      </div>
    </div>
  );
};

export default AddFriendModalContent;