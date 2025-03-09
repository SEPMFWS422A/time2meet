import Joi from "joi";

// ObjectId-Validierung wenn man z.b die ID der participents angibt oder der Groups etc
const objectIdValidator = Joi.string().length(24).messages({
  'string.length': 'Ungültige ID: Muss genau 24 Zeichen lang sein'
});

export const surveyJoiValidationSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.min': 'Titel muss mindestens 3 Zeichen lang sein',
      'any.required': 'Titel ist erforderlich'
    }),

  description: Joi.string().allow('').optional(),

  options: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required().messages({
          'any.required': 'Options-Titel ist erforderlich'
        }),
        votedBy: Joi.array().items(objectIdValidator).forbidden().default([]) //Wenn man eine Survey erstellt mit Options soll man 'votedby' nicht ausfüllen dürfen beim erstellen
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Mindestens eine Option ist erforderlich'
    }),

  dateTimeSelections: Joi.array()
    .items(
      Joi.object({
        /*
        Joi Validiert das Datum nach UTC. Wenn ich jedoch das heutige Datum eingebe z.b den 09.03.2025, dann passiert folgendes: 
        Für Joi ist 2025-03-09T00:00:00Z (Eingabe) < 2025-03-09T18:40:00Z (jetzt)
        Also liegt die Eingabe in der zeit zurück Deshalb musste ich diese Änderungen in der Überprüfung durchnehmen so das er nur aufs Datum schaut und nicht auf die Uhrzeit
        */
        date: Joi.string()
          .pattern(/^\d{4}-\d{2}-\d{2}$/)
          .required()
          .custom((value, helpers) => {
            const now = new Date();
            const today = new Date(
              now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' })
            );
            today.setHours(0, 0, 0, 0);

            const inputDate = new Date(value + 'T00:00:00+01:00');
            inputDate.setHours(0, 0, 0, 0);

            if (inputDate < today) {
              return helpers.error('date.past');
            }
            return value;
          })
          .messages({
            'string.pattern.base': 'Datum muss YYYY-MM-DD sein',
            'date.past': 'Datum darf nicht in der Vergangenheit liegen',
            'any.required': 'Datum ist erforderlich'
          }),
        timeSlots: Joi.array()
          .items(
            Joi.object({
              startTime: Joi.string()
                .required()
                .pattern(/^\d{2}:\d{2}$/)
                .messages({
                  'string.pattern.base': 'Startzeit muss HH:MM Format sein',
                  'any.required': 'Startzeit ist erforderlich'
                }),
              endTime: Joi.string()
                .required()
                .pattern(/^\d{2}:\d{2}$/)
                .custom((value, helpers) => {
                  const startTime = helpers.state.ancestors[0].startTime;
                  const [startH, startM] = startTime.split(':').map(Number);
                  const [endH, endM] = value.split(':').map(Number);
                    //Endzeit darf nicht vor der Startzeit liegen
                  if (endH < startH || (endH === startH && endM <= startM)) {
                    return helpers.error('any.invalid');
                  }
                  return value;
                })
                .messages({
                  'string.pattern.base': 'Endzeit muss HH:MM Format sein',
                  'any.required': 'Endzeit ist erforderlich',
                  'any.invalid': 'Endzeit muss nach Startzeit liegen'
                })
            })
          )
          .min(1)
          .required()
          .messages({
            'array.min': 'Mindestens ein Zeitfenster ist erforderlich'
          })
      })
    )
    .optional(),

    expiresAt: Joi.date()
    .iso()
    .min('now')
    .optional()
    .messages({
      'date.min': 'Ablaufdatum muss in der Zukunft liegen',
      'date.format': 'Ungültiges Datumsformat'
    }),

  status: Joi.string()
    .valid('entwurf', 'aktiv', 'geschlossen')
    .default('entwurf'),

  location: Joi.string().allow('').optional(),

  participants: Joi.array()
    .items(objectIdValidator)
    .optional(),

  groupId: objectIdValidator.optional()

}).options({ 
  abortEarly: false,
  stripUnknown: true 
});
