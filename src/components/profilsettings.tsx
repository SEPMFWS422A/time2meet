'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { postProfilePicture } from "@/lib/api_methods/profilePicture/postProfilePicture/postProfilePicture";

interface UserData {
  vorname: string;
  name: string;
  benutzername: string;
  email: string;
  telefonnummer: string;
  geburtsdatum: string;
  profilsichtbarkeit: string;
  kalendersichtbarkeit: string;
  theme: string;
  profilbild: string;
}

export function ProfilSettings() {
  const [userData, setUserData] = useState<UserData>({
    vorname: "",
    name: "",
    benutzername: "",
    email: "",
    telefonnummer: "",
    geburtsdatum: "",
    profilsichtbarkeit: "Öffentlich",
    kalendersichtbarkeit: "Öffentlich",
    theme: "Hell",
    profilbild: ""
  });
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(true);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => {
        setPopupMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  useEffect(() => {
    const decodeToken = async () => {
      try {
        const res = await fetch("/api/userauth/decode", {
          credentials: "include"
        });
        const data = await res.json();
        if (data.id) {
          setUserId(data.id);
        } else {
          console.error("Token not found on server:", data);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };
    decodeToken();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`/api/user/${userId}`, {
          withCredentials: true
        });
        setUserData(res.data.data);
      } catch (error) {
        console.error("Fehler beim Abrufen der Benutzerdaten:", error);
      }
    };
    fetchUserData();
  }, [userId]);


  const handleImageUpload = async (file: File) => {
    if (!userId) {
      setFileError("Benutzer nicht angemeldet");
      return;
    }
  
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
  
      try {
        await postProfilePicture(userId,base64String);
        
        setUserData((prev) => ({
          ...prev,
          profilbild: base64String,
        }));
  
        setProfileImagePreview(base64String);
        setPopupMessage("Profilbild erfolgreich aktualisiert!");
        setFileError(null);
      } catch (error: any) {
        console.error("Upload fehlgeschlagen:", error);
        setFileError(error.response?.data?.error || "Fehler beim Hochladen des Bildes");
        setProfileImagePreview(null);
      }
    };
  
    reader.readAsDataURL(file); // Starte die Konvertierung
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setUserData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleBirthDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = new Date(event.target.value);
    const currentDate = new Date();
    inputDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    if (inputDate > currentDate) {
      setBirthDateError("Das Geburtsdatum darf nicht nach dem aktuellen Datum liegen.");
      setIsFormValid(false);
    } else {
      setBirthDateError(null);
      setIsFormValid(fileError === null && phoneError === null);
    }
    handleInputChange(event);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFileError("Nur Bilddateien sind erlaubt.");
        setIsFormValid(false);
        setProfileImagePreview(null);
        return;
      }
      
      if (file.size > 1 * 1024 * 1024) {
        setFileError("Maximale Dateigröße: 1MB");
        setIsFormValid(false);
        setProfileImagePreview(null);
        return;
      }

      setFileError(null);
      setIsFormValid(true);
      setProfileImagePreview(URL.createObjectURL(file));
      handleImageUpload(file);
    }
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const phoneRegex = /^\+?[0-9\s-]*$/;
    const phoneValue = event.target.value;
    if (phoneValue && !phoneRegex.test(phoneValue)) {
      setPhoneError("Bitte geben Sie eine gültige Telefonnummer ein.");
      setIsFormValid(false);
    } else {
      setPhoneError(null);
      setIsFormValid(birthDateError === null && fileError === null);
    }
    handleInputChange(event);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;
    if (!userId) {
      setUpdateError("Benutzer-ID nicht gefunden.");
      return;
    }
    try {
      const res = await axios.patch(`/api/user/${userId}`, userData, {
        withCredentials: true
      });
      console.log("Profil erfolgreich aktualisiert:", res.data);
      setUpdateError(null);
      setPopupMessage("Profil erfolgreich aktualisiert!");
    } catch (error: any) {
      console.error("Es gab einen Fehler beim Aktualisieren der Benutzerdaten:", error);
      setUpdateError("Es gab einen Fehler beim Aktualisieren der Benutzerdaten.");
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Neue Passwörter stimmen nicht überein.");
      return;
    }
    if (!currentPassword || !newPassword) {
      setPasswordError("Bitte füllen Sie alle Passwortfelder aus.");
      return;
    }
    setPasswordError(null);
    try {
      const res = await axios.patch(
        `/api/user/${userId}`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      console.log("Passwort erfolgreich aktualisiert:", res.data);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordPopup(false);
      setPopupMessage("Passwort erfolgreich aktualisiert!");
    } catch (error: any) {
      console.error("Fehler beim Aktualisieren des Passworts:", error);
      setPasswordError("Fehler beim Aktualisieren des Passworts.");
    }
  };

  return (
    <div className="flex justify-center mx-3 md:mx-0 mb-14 md:mb-4">
      <div className="bg-white w-full max-w-lg p-6">
        <h1 id="header-title" className="text-2xl font-bold mb-4 text-center">
          Profil verwalten
        </h1>
        <p id="header-description" className="text-base text-gray-600 text-center mb-6">
          Hier können Sie Ihre Profilinformationen ändern und anpassen.
        </p>
        <form id="profile-form" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="profile-picture-input" className="block text-base font-medium mb-1">
              Profilbild
            </label>
            <input
            id="profile-picture-input"
            type="file"
            className="block w-full border rounded-lg p-2 text-sm"
            onChange={handleFileChange}
            accept="image/*"
          />
            {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
            {(profileImagePreview || userData.profilbild) && (
            <img
              id="imagePreview"
              src={profileImagePreview || userData.profilbild}
              alt="Profil Bild"
              className="w-32 h-32 object-cover rounded-full mx-auto mt-2"
            />
          )}
          </div>
          <div>
            <label htmlFor="first-name-input" className="block text-base font-medium mb-1">
              Vorname
            </label>
            <input
              id="first-name-input"
              type="text"
              name="vorname"
              placeholder="Vorname"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.vorname || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="last-name-input" className="block text-base font-medium mb-1">
              Nachname
            </label>
            <input
              id="last-name-input"
              type="text"
              name="name"
              placeholder="Nachname"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.name || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="username-input" className="block text-base font-medium mb-1">
              Benutzername
            </label>
            <input
              id="username-input"
              type="text"
              name="benutzername"
              placeholder="Benutzername"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.benutzername || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email-label" className="block text-base font-medium mb-1">
              E-Mail-Adresse
            </label>
            <p id="email-display" className="block w-full border rounded-lg p-2 text-sm bg-gray-100">
              {userData.email || ""}
            </p>
          </div>
          <div>
            <label htmlFor="phone-input" className="block text-base font-medium mb-1">
              Telefonnummer (optional)
            </label>
            <input
              id="phone-input"
              type="tel"
              name="telefonnummer"
              placeholder="Telefonnummer"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.telefonnummer || ""}
              onChange={handlePhoneChange}
            />
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
          </div>
          <div>
            <label htmlFor="birth-date-input" className="block text-base font-medium mb-1">
              Geburtsdatum (optional)
            </label>
            <input
              id="birth-date-input"
              type="date"
              name="geburtsdatum"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.geburtsdatum ? new Date(userData.geburtsdatum).toISOString().split("T")[0] : ""}
              onChange={handleBirthDateChange}
            />
            {birthDateError && <p className="text-red-500 text-sm mt-1">{birthDateError}</p>}
          </div>
          <div>
            <label htmlFor="profile-visibility-input" className="block text-base font-medium mb-1">
              Profil-Sichtbarkeit
            </label>
            <select
              id="profile-visibility-input"
              name="profilsichtbarkeit"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.profilsichtbarkeit}
              onChange={handleInputChange}
            >
              <option>Öffentlich</option>
              <option>Nur Freunde</option>
              <option>Privat</option>
            </select>
          </div>
          <div>
            <label htmlFor="calendar-visibility-input" className="block text-base font-medium mb-1">
              Kalender-Sichtbarkeit
            </label>
            <select
              id="calendar-visibility-input"
              name="kalendersichtbarkeit"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.kalendersichtbarkeit}
              onChange={handleInputChange}
            >
              <option>Öffentlich</option>
              <option>Nur Freunde</option>
              <option>Privat</option>
            </select>
          </div>
          <div>
            <label htmlFor="theme-input" className="block text-base font-medium mb-1">
              Theme
            </label>
            <select
              id="theme-input"
              name="theme"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.theme}
              onChange={handleInputChange}
            >
              <option>Hell</option>
              <option>Dunkel</option>
            </select>
          </div>
          <div className="mb-4 text-center">
            <button
              type="button"
              className="bg-green-500 text-white rounded-lg py-2 px-4 font-semibold hover:bg-green-600"
              onClick={() => setShowPasswordPopup(true)}
            >
              Passwort ändern
            </button>
          </div>
          <div className="text-center">
            <label htmlFor="privacy-policy-label" className="block text-base font-medium mb-1">
              Datenschutz
            </label>
            <p id="privacy-policy-p">
              <a id="privacy-policy-link" href="/privacy-policy" className="text-blue-500 underline">
                Datenschutzrichtlinien anzeigen
              </a>
            </p>
          </div>
          {updateError && <p className="text-red-500 text-sm mt-1 text-center">{updateError}</p>}
          <div id="Submitdiv">
            <button
              id="save-changes"
              type="submit"
              className={`w-full bg-[#082f49] text-white rounded-lg py-2 font-semibold hover:bg-[#082f49]/90 ${
                !isFormValid ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isFormValid}
            >
              Änderungen speichern
            </button>
          </div>
        </form>
        {userId ? <p className="mt-4 text-center">User ID: {userId}</p> : <p>Loading...</p>}
      </div>
      {popupMessage && (
        <div id="popUpMessage" className="fixed top-4 right-4 z-50">
          <div className="bg-[#082f49] rounded-lg shadow-lg p-4">
            <p className="text-white">{popupMessage}</p>
          </div>
        </div>
      )}
      {showPasswordPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">Passwort ändern</h2>
            <form id="password-form" onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label htmlFor="current-password-input" className="block text-base font-medium mb-1">
                  Aktuelles Passwort
                </label>
                <input
                  id="current-password-input"
                  type="password"
                  name="currentPassword"
                  placeholder="Aktuelles Passwort"
                  className="block w-full border rounded-lg p-2 text-sm"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="new-password-input" className="block text-base font-medium mb-1">
                  Neues Passwort
                </label>
                <input
                  id="new-password-input"
                  type="password"
                  name="newPassword"
                  placeholder="Neues Passwort"
                  className="block w-full border rounded-lg p-2 text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-new-password-input" className="block text-base font-medium mb-1">
                  Neues Passwort bestätigen
                </label>
                <input
                  id="confirm-new-password-input"
                  type="password"
                  name="confirmNewPassword"
                  placeholder="Neues Passwort bestätigen"
                  className="block w-full border rounded-lg p-2 text-sm"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              {passwordError && <p className="text-red-500 text-sm text-center">{passwordError}</p>}
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-500 text-white rounded-lg py-2 px-4 font-semibold hover:bg-green-600"
                >
                  Aktualisieren
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white rounded-lg py-2 px-4 font-semibold hover:bg-gray-600"
                  onClick={() => setShowPasswordPopup(false)}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}