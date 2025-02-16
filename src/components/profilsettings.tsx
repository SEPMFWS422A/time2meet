import React, { useState } from "react";

interface UserData {
  vorname: string;
  name: string;
  benutzername: string;
  email: string;
  telefonnummer?: string;
  geburtsdatum?: string;
  profilsichtbarkeit: string;
  kalendersichtbarkeit: string;
  theme: string;
  password?: string;
}

export function ProfilSettings() {
  const [userData, setUserData] = useState<UserData>({
    vorname: "John",
    name: "Doe",
    benutzername: "johndoe",
    email: "john.doe@example.com",
    telefonnummer: "123456789",
    geburtsdatum: "1990-01-01",
    profilsichtbarkeit: "Öffentlich",
    kalendersichtbarkeit: "Öffentlich",
    theme: "Hell",
    password: "password123"
  });
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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

    if (file && !file.type.startsWith("image/")) {
      setFileError("Nur Bilddateien sind erlaubt.");
      setIsFormValid(false);
    } else {
      setFileError(null);
      setIsFormValid(birthDateError === null && phoneError === null);
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
    if (!isFormValid) {
      return;
    }

    try {
      console.log('Benutzerdaten erfolgreich aktualisiert:', userData);
      setUpdateError(null);
    } catch (error: any) {
      console.error('Es gab einen Fehler beim Aktualisieren der Benutzerdaten:', error);
      setUpdateError('Es gab einen Fehler beim Aktualisieren der Benutzerdaten.');
    }
  };

  return (
    <div className="flex justify-center mx-3 md:mx-0 mb-14 md:mb-4">
      <div className="bg-white w-full max-w-lg">
        <h1 id="header-title" className="text-2xl font-bold mb-4 text-center">
          Profil verwalten
        </h1>
        <p id="header-description" className="text-base text-gray-600 text-center mb-6">
          Hier können Sie Ihre Profilinformationen ändern und anpassen.
        </p>

        <form id="profile-form" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label id="profile-picture-label" className="block text-base md:text-sm font-medium mb-1">
              Profilbild
            </label>
            <input
              id="profile-picture-input"
              type="file"
              className="block w-full border rounded-lg p-2 text-sm"
              onChange={handleFileChange}
            />
            {fileError && (
              <p className="text-red-500 text-sm mt-1">{fileError}</p>
            )}
          </div>

          <div>
            <label id="first-name-label" className="block text-base md:text-sm font-medium mb-1">
              Vorname
            </label>
            <input
              id="first-name-input"
              type="text"
              name="vorname"
              placeholder="Vorname"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.vorname}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label id="last-name-label" className="block text-base md:text-sm font-medium mb-1">
              Nachname
            </label>
            <input
              id="last-name-input"
              type="text"
              name="name"
              placeholder="Nachname"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label id="username-label" className="block text-base md:text-sm font-medium mb-1">
              Benutzername
            </label>
            <input
              id="username-input"
              type="text"
              name="benutzername"
              placeholder="Benutzername"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.benutzername}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label id="email-label" className="block text-base md:text-sm font-medium mb-1">
              E-Mail-Adresse
            </label>
            <p id="email-display" className="block w-full border rounded-lg p-2 text-sm bg-gray-100">
              {userData.email}
            </p>
          </div>

          <div>
            <label id="password-label" className="block text-base md:text-sm font-medium mb-1">
              Passwort
            </label>
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Passwort"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.password || ""}
              onChange={handleInputChange}
              required
            />
            <div className="flex flex-row mt-2">
              <input
                id="show-password-checkbox"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="show-password-checkbox" className="ml-2 text-sm">
                Passwort anzeigen
              </label>
            </div>
          </div>

          <div>
            <label id="phone-label" className="block text-base md:text-sm font-medium mb-1">
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
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
          </div>

          <div>
            <label id="birth-date-label" className="block text-base md:text-sm font-medium mb-1">
              Geburtsdatum (optional)
            </label>
            <input
              id="birth-date-input"
              type="date"
              name="geburtsdatum"
              className="block w-full border rounded-lg p-2 text-sm"
              value={userData.geburtsdatum ? new Date(userData.geburtsdatum).toISOString().split('T')[0] : ''}
              onChange={handleBirthDateChange}
            />
            {birthDateError && (
              <p className="text-red-500 text-sm mt-1">{birthDateError}</p>
            )}
          </div>

          <div>
            <label id="profile-visibility-label" className="block text-base md:text-sm font-medium mb-1">
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
            <label id="calendar-visibility-label" className="block text-base md:text-sm font-medium mb-1">
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
            <label id="theme-label" className="block text-base md:text-sm font-medium mb-1">
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

          <div className="text-center">
            <label id="privacy-policy-label" className="block text-base md:text-sm font-medium mb-1">
              Datenschutz
            </label>
            <p id="privacy-policy-p">
              <a
                id="privacy-policy-link"
                href="/privacy-policy"
                className="text-blue-500 underline"
              >
                Datenschutzrichtlinien anzeigen
              </a>
            </p>
          </div>

          {updateError && (
            <p className="text-red-500 text-sm mt-1 text-center">{updateError}</p>
          )}

          <div id="Submitdiv">
            <button
              id="save-changes"
              type="submit"
              className={`w-full bg-blue-500 text-white rounded-lg py-2 font-semibold hover:bg-blue-600 ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!isFormValid}
            >
              Änderungen speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}