"use client";

export function ProfilSettings() {
    return (
        <div className="bg-white w-full max-w-lg rounded-lg shadow-lg">
            <h1 id="header-title" className="text-2xl font-bold mb-4 text-center">
                Profil verwalten
            </h1>
            <p id="header-description" className="text-sm text-gray-600 text-center mb-6">
                Hier können Sie Ihre Profilinformationen ändern und anpassen.
            </p>

        <form id="profile-form" className="space-y-4">
          <div>
            <label id="profile-picture-label" className="block text-sm font-medium mb-1">
              Profilbild
            </label>
            <input
              id="profile-picture-input"
              type="file"
              className="block w-full border rounded-lg p-2 text-sm"
            />
          </div>

          <div>
            <label id="first-name-label" className="block text-sm font-medium mb-1">
              Vorname
            </label>
            <input
              id="first-name-input"
              type="text"
              placeholder="Vorname"
              className="block w-full border rounded-lg p-2 text-sm"
              required
            />
          </div>

                <div>
                    <label id="last-name-label" className="block text-sm font-medium mb-1">
                        Nachname
                    </label>
                    <input
                        id="last-name-input"
                        type="text"
                        placeholder="Nachname"
                        className="block w-full border rounded-lg p-2 text-sm"
                        required
                    />
                </div>

                <div>
                    <label id="username-label" className="block text-sm font-medium mb-1">
                        Benutzername
                    </label>
                    <input
                        id="username-input"
                        type="text"
                        placeholder="Benutzername"
                        className="block w-full border rounded-lg p-2 text-sm"
                        required
                    />
                </div>

                <div>
                    <label id="email-label" className="block text-sm font-medium mb-1">
                        E-Mail-Adresse
                    </label>
                    <input
                        id="email-input"
                        type="email"
                        placeholder="E-Mail-Adresse"
                        className="block w-full border rounded-lg p-2 text-sm"
                        required
                    />
                </div>

                <div>
                    <label id="password-label" className="block text-sm font-medium mb-1">
                        Passwort
                    </label>
                    <input
                        id="password-input"
                        type="password"
                        placeholder="Passwort"
                        className="block w-full border rounded-lg p-2 text-sm"
                        required
                    />
                </div>

                <div>
                    <label id="phone-label" className="block text-sm font-medium mb-1">
                        Telefonnummer (optional)
                    </label>
                    <input
                        id="phone-input"
                        type="tel"
                        placeholder="Telefonnummer"
                        className="block w-full border rounded-lg p-2 text-sm"
                    />
                </div>

                <div>
                    <label id="birth-date-label" className="block text-sm font-medium mb-1">
                        Geburtsdatum (optional)
                    </label>
                    <input
                        id="birth-date-input"
                        type="date"
                        className="block w-full border rounded-lg p-2 text-sm"
                    />
                </div>

                <div>
                    <label id="profile-visibility-label" className="block text-sm font-medium mb-1">
                        Profil-Sichtbarkeit
                    </label>
                    <select
                        id="profile-visibility-input"
                        className="block w-full border rounded-lg p-2 text-sm"
                    >
                        <option>Öffentlich</option>
                        <option>Nur Freunde</option>
                        <option>Privat</option>
                    </select>
                </div>

                <div>
                    <label id="calendar-visibility-label" className="block text-sm font-medium mb-1">
                        Kalender-Sichtbarkeit
                    </label>
                    <select
                        id="calendar-visibility-input"
                        className="block w-full border rounded-lg p-2 text-sm"
                    >
                        <option>Öffentlich</option>
                        <option>Nur Freunde</option>
                        <option>Privat</option>
                    </select>
                </div>

                <div>
                    <label id="theme-label" className="block text-sm font-medium mb-1">
                        Theme
                    </label>
                    <select id="theme-input" className="block w-full border rounded-lg p-2 text-sm">
                        <option>Hell</option>
                        <option>Dunkel</option>
                    </select>
                </div>

                <div className="text-center">
                    <label id="privacy-policy-label" className="block text-sm font-medium mb-1">
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

                <div id="Submitdiv">
                    <button
                        id="save-changes"
                        type="submit"
                        className="w-full bg-blue-500 text-white rounded-lg py-2 font-semibold hover:bg-blue-600"
                    >
                        Änderungen speichern
                    </button>
                </div>
            </form>
        </div>
    );
}
