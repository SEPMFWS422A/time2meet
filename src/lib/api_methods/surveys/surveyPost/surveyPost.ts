import { ISurveyPostBody } from "@/lib/interfaces/ISurveyPostBody";

export const postSurvey = async (data: ISurveyPostBody) => {
  try {
    return await fetch("api/surveys", {
        method: 'POST',
        headers: {
             'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then((res)=> {
        if (res.status === 201) {
            return {
                code: res.status,
                message: 'Umfrage erfolgreich erstellt',
                status: 'success'
            }
          }

          if (res.status === 400) {
            return {
                code: res.status,
                message: 'Eingabefehler',
                status: 'error'
            }
          }
          if (res.status === 401) {
            return {
                code: res.status,
                message: 'Unautorisiert',
                status: 'error'
            }
          }
          if (res.status === 403) {
            return {
                code: res.status,
                message: 'Ungültige Session',
                status: 'error'
            }
          }
    });
  } catch (error: any) {
    console.error("Fehler beim Senden der Daten:", error.response?.data || error.message|| error);
    throw error;
  }
};
