"use client";

export function ProfilSettings() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-8">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4 text-center">Profil verwalten</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Hier können Sie Ihre Profilinformationen ändern und anpassen.
        </p>

        {/* Allgemeine Informationen */}
        <form className="space-y-4">
          {/* Profilbild */}
          <div>
            <label className="block text-sm font-medium mb-1">Profilbild</label>
            <input
              type="file"
              className="block w-full border rounded-lg p-2 text-sm"
            />
          </div>

          {/* Vorname */}
          <div>
            <label className="block text-sm font-medium mb-1">Vorname</label>
            <input
              type="text"
              placeholder="Vorname"
              className="block w-full border rounded-lg p-2 text-sm"
              required
            />
          </div>

          {/* Nachname */}
          <div>
            <label className="block text-sm font-medium mb-1">Nachname</label>
            <input
              type="text"
              placeholder="Nachname"
              className="block w-full border rounded-lg p-2 text-sm"
              required
            />
          </div>

          {/* Benutzername */}
          <div>
            <label className="block text-sm font-medium mb-1">Benutzername</label>
            <input
              type="text"
              placeholder="Benutzername"
              className="block w-full border rounded-lg p-2 text-sm"
              required
            />
          </div>

          {/* E-Mail-Adresse */}
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail-Adresse</label>
            <input
              type="email"
              placeholder="E-Mail-Adresse"
              className="block w-full border rounded-lg p-2 text-sm"
              required
            />
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-sm font-medium mb-1">Passwort</label>
            <input
              type="password"
              placeholder="Passwort"
              className="block w-full border rounded-lg p-2 text-sm"
              required
            />
          </div>

          {/* Telefonnummer (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">Telefonnummer (optional)</label>
            <input
              type="tel"
              placeholder="Telefonnummer"
              className="block w-full border rounded-lg p-2 text-sm"
            />
          </div>

          {/* Geburtsdatum (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">Geburtsdatum (optional)</label>
            <input
              type="date"
              className="block w-full border rounded-lg p-2 text-sm"
            />
          </div>

          {/* Privatsphäre */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Profil-Sichtbarkeit
            </label>
            <select className="block w-full border rounded-lg p-2 text-sm">
              <option>Öffentlich</option>
              <option>Nur Freunde</option>
              <option>Privat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Kalender-Sichtbarkeit
            </label>
            <select className="block w-full border rounded-lg p-2 text-sm">
              <option>Öffentlich</option>
              <option>Nur Freunde</option>
              <option>Privat</option>
            </select>
          </div>

          {/* Personalisierung */}
          <div>
            <label className="block text-sm font-medium mb-1">Theme</label>
            <select className="block w-full border rounded-lg p-2 text-sm">
              <option>Hell</option>
              <option>Dunkel</option>
            </select>
          </div>

          {/* Datenschutz */}
          <div>
            <label className="block text-sm font-medium mb-1">Datenschutz</label>
            <p className="text-sm text-gray-600">
              <a href="/datenschutz" className="text-blue-500 underline">
                Datenschutzrichtlinien anzeigen
              </a>
            </p>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white rounded-lg py-2 font-semibold hover:bg-blue-600"
            >
              Änderungen speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
