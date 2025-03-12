export const postProfilePicture = async (userId: string, imageBase64string: string): Promise<void> => {
    try {
      const response = await fetch(`/api/user/${userId}/uploadProfilePic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, image: imageBase64string }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fehler beim Hochladen des Bildes");
      }
  
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Fehler beim Senden der Daten:", error.message || error);
      throw error;
    }
  };