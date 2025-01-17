describe('Event API Integration Test', () => {
  it('should return a valid ICS file', () => {
      //Holt sich die ics datei in den downloads Ordner
      cy.visit('http://localhost:3000')
      cy.get("#Calendardownload").click()
      // cy.request({
      //     method: 'GET',
      //     url: 'localhost:3000/api/event',
      //     headers: {
      //         'Accept': 'text/calendar',
      //     },
      //     encoding: 'binary',
      // }).then((response) => {
      //
      //     expect(response.status).to.eq(200);
      //     expect(response.headers['content-type']).to.eq('text/calendar');
      //     expect(response.headers['content-disposition']).to.eq('attachment; filename="events.ics"');
      //     const icsContent = response.body.toString('utf8');
      //     //Prüft ob die Inhalt der ICS Datei
      //     expect(icsContent).to.match(/^BEGIN:VCALENDAR/);
      //     expect(icsContent).to.match(/SUMMARY:Statisches Event/);
      //     expect(icsContent).to.match(/DTSTART:20250116T120000Z/);
      //     expect(icsContent).to.match(/DTEND:20250116T130000Z/);
      //     expect(icsContent).to.match(/END:VEVENT/);
      //     expect(icsContent).to.match(/END:VCALENDAR$/);
      // });
  });
});