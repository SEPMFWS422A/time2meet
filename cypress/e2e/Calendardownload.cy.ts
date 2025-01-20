import { events } from '../../src/app/lib/data/events';

describe('Event API Integration Test', () => {
    it('should return a valid ICS file with correct content', () => {

        cy.visit('http://localhost:3000')

        cy.get("#Calendardownload").click()

        cy.request({
            method: 'GET',
            url: 'localhost:3000/api/event',
            headers: {
                'Accept': 'text/calendar',
            },
            encoding: 'binary',
        }).then((response) => {

            expect(response.status).to.eq(200);
            expect(response.headers['content-type']).to.eq('text/calendar');
            expect(response.headers['content-disposition']).to.eq('attachment; filename="events.ics"');


            const icsContent = Buffer.from(response.body, 'binary').toString('utf8');

            expect(icsContent).to.match(/^BEGIN:VCALENDAR/);
            expect(icsContent).to.match(/END:VCALENDAR$/);



            events.forEach((event) => {

                expect(icsContent).to.include(`SUMMARY:${event.title}`);

                let start = "";
                let end = "";

                if (event.allDay) {
                    start = `;VALUE=DATE:${String(event.start).replace(/[-:]/g, "").split('T')[0]}`;


                    const eventStart = new Date(event.start as string);
                    eventStart.setDate(eventStart.getDate() + 1);

                    const year = eventStart.getFullYear();
                    const month = String(eventStart.getMonth() + 1).padStart(2, '0');
                    const day = String(eventStart.getDate()).padStart(2, '0');
                    end = `;VALUE=DATE:${year}${month}${day}`;
                } else {
                    start = `:${String(event.start).replace(/[-:]/g, "")}`;
                    end = `:${String(event.end).replace(/[-:]/g, "")}`;
                }

                expect(icsContent).to.include(`DTSTART${start}`);
                expect(icsContent).to.include(`DTEND${end}`);


                expect(icsContent).to.include(`DESCRIPTION:${event.description}`);


                const correctedLocation = event.location.normalize('NFC');
                expect(icsContent).to.include(`LOCATION:${correctedLocation}`);
            });
        });
    })
})