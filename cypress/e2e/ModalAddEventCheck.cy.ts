describe('AddModalContentCheck', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
        cy.get('td.fc-day').not('.fc-event').first().click();
        cy.get('section[role="dialog"]').should('be.visible');
    });

    it('Open Modal Window when clicking on a Free date', () => {
        cy.get('section[role="dialog"]').should('be.visible');
        cy.get('section[role="dialog"] header').should('have.text', 'Event hinzufügen');
        cy.get('#addEventForm').should('exist');
        cy.get('input[placeholder="Geben Sie den Titel des Ereignisses ein"]').should('be.visible');
        cy.get('input[placeholder="Geben Sie die Beschreibung des Ereignisses ein"]').should('be.visible');
        cy.get('input[placeholder="Wählen Sie Startdatum und -uhrzeit"]').should('be.visible');
        cy.get('input[placeholder="Geben Sie den Ort ein"]').should('be.visible');
        cy.get('button').contains('Schließen').should('be.visible');
        cy.get('button').contains('Ereignis speichern').should('be.visible');
    });

    it('should on invalid Input show an error message', () => {
        cy.get('section[role="dialog"]').should('be.visible');
        cy.get('button').contains('Ereignis speichern').click(); 
        cy.get('#generalFormError').should('be.visible');

        cy.get('input[placeholder="Geben Sie den Titel des Ereignisses ein"]').type('Test Event');
        cy.get('button').contains('Ereignis speichern').click();
        cy.get('#generalFormError').should('be.visible');

        cy.get('#generalFormError').should('contain', 'Überprüfen Sie Ihre Eingaben');
    });

    it('should save an all-day event', () => {
        cy.get('section[role="dialog"]').should('be.visible');
        cy.get('input[placeholder="Geben Sie den Titel des Ereignisses ein"]').type('Test All-Day Event');
        cy.get('input[placeholder="Geben Sie die Beschreibung des Ereignisses ein"]').type('Test description');
        cy.get('input[placeholder="Wählen Sie Startdatum und -uhrzeit"]').type('2025-01-22T10:00');
        cy.get('input[placeholder="Geben Sie den Ort ein"]').type('Test location');
        cy.get('input[type="checkbox"]').check(); 
      
        cy.get('button').contains('Ereignis speichern').should('not.be.disabled'); 
        cy.get('button').contains('Ereignis speichern').click();
      
        cy.get('section[role="dialog"]').should('not.exist');

        cy.get('#HomePageLayout').find('td[data-date="2025-01-22"]').find('a.fc-event').should('have.class', 'fc-event').and('include.text', 'Test All-Day Event');
      });

    it('should save an event with start and end time', () => {
        cy.get('section[role="dialog"]').should('be.visible');
      
        cy.get('input[placeholder="Geben Sie den Titel des Ereignisses ein"]').type('Test normal Event');
        cy.get('input[placeholder="Geben Sie die Beschreibung des Ereignisses ein"]').type('Test description');
        cy.get('input[placeholder="Wählen Sie Startdatum und -uhrzeit"]').type('2025-01-22T10:00');
        cy.get('input[placeholder="Wählen Sie Enddatum und -uhrzeit"]').type('2025-01-22T12:00');
        cy.get('input[placeholder="Geben Sie den Ort ein"]').type('Test location');
      
        cy.get('button').contains('Ereignis speichern').should('not.be.disabled');
        cy.get('button').contains('Ereignis speichern').click();
      
        cy.get('section[role="dialog"]').should('not.exist');

        cy.get('#HomePageLayout').find('td[data-date="2025-01-22"]').find('a.fc-event').should('have.class', 'fc-event').and('include.text', 'Test normal Event');
    });

    it('should show invalid input for "Endtime" when "Endtime" is in the past compared to "Starttime" ', () => {
        cy.get('section[role="dialog"]').should('be.visible');
      
        cy.get('input[placeholder="Geben Sie den Titel des Ereignisses ein"]').type('Test normal Event');
        cy.get('input[placeholder="Wählen Sie Startdatum und -uhrzeit"]').type('2025-01-22T10:00');
        cy.get('input[placeholder="Wählen Sie Enddatum und -uhrzeit"]').type('2025-01-21T12:00');

        cy.get('div[data-invalid="true"]').should('contain', 'Ungültige Endzeit');    
        cy.get('button').contains('Ereignis speichern').click();
        cy.get('#generalFormError').should('be.visible').should('contain', 'Überprüfen Sie Ihre Eingaben'); 
    });
});
