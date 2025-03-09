describe('AddModalContentCheck', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');

        cy.get('input#email').type('K2@K2.com');
        cy.get('input#password').type('123');
        cy.contains('button', 'Anmelden').click();
        cy.url().should('eq', 'http://localhost:3000/');

        cy.get('td.fc-day').not('.fc-event').first().click();
        cy.get('section[role="dialog"]').should('be.visible');
    });

    it('Open Modal Window when clicking on a Free date', () => {
        cy.get('section[role="dialog"]').should('be.visible');
        cy.get('section[role="dialog"] header').should('have.text', 'Event hinzufügen');
        cy.get('#addEventForm').should('exist');
        cy.get('#title').should('be.visible');
        cy.get('#description').should('be.visible');
        cy.get('input[placeholder="Wählen Sie Startdatum und -uhrzeit"]').should('be.visible');
        cy.get('input[placeholder="Geben Sie den Ort ein"]').should('be.visible');
        cy.get('button').contains('Schließen').should('be.visible');
        cy.get('button').contains('Ereignis speichern').should('be.visible');
    });

    it('should on invalid Input show an error message', () => {
        cy.get('section[role="dialog"]').should('be.visible');
        cy.get('button').contains('Ereignis speichern').click(); 
        cy.get('#generalFormError').should('be.visible');

        cy.get('#title').type('Test Event');
        cy.get('button').contains('Ereignis speichern').click();
        cy.get('#generalFormError').should('be.visible');

        cy.get('#generalFormError').should('contain', 'Bitte alle erforderlichen Felder ausfüllen.');
    });

    it('should save an all-day event', () => {
        cy.get('section[role="dialog"]').should('be.visible');
        cy.get('input[type="checkbox"]').check(); 
        cy.get('#title').type('Test All-Day Event');
        cy.get('#description').type('Test description');
        cy.get('input[placeholder="Wählen Sie das Startdatum"]').type('2025-03-22');
        cy.get('input[placeholder="Geben Sie den Ort ein"]').type('Test location');
      
        cy.get('button').contains('Ereignis speichern').should('not.be.disabled'); 
        cy.get('button').contains('Ereignis speichern').click();
      
        cy.get('section[role="dialog"]').should('not.exist');

        cy.get('#HomePageLayout').find('td[data-date="2025-03-22"]').find('a.fc-event').should('have.class', 'fc-event').and('include.text', 'Test All-Day Event');
      });

    it('should save an event with start and end time', () => {
        cy.get('section[role="dialog"]').should('be.visible');
      
        cy.get('#title').type('Test normal Event');
        cy.get('#description').type('Test description');
        cy.get('input[placeholder="Wählen Sie Startdatum und -uhrzeit"]').type('2025-03-22T10:00');
        cy.get('input[placeholder="Wählen Sie Enddatum und -uhrzeit"]').type('2025-03-22T12:00');
        cy.get('input[placeholder="Geben Sie den Ort ein"]').type('Test location');
      
        cy.get('button').contains('Ereignis speichern').should('not.be.disabled');
        cy.get('button').contains('Ereignis speichern').click();
      
        cy.get('section[role="dialog"]').should('not.exist');

        cy.get('#HomePageLayout').find('td[data-date="2025-03-22"]').find('a.fc-event').should('have.class', 'fc-event').and('include.text', 'Test normal Event');
    });

    it('should show invalid input for "Endtime" when "Endtime" is in the past compared to "Starttime" ', () => {
        cy.get('section[role="dialog"]').should('be.visible');
      
        cy.get('#title').type('Test normal Event');
        cy.get('input[placeholder="Wählen Sie Startdatum und -uhrzeit"]').type('2025-03-22T10:00');
        cy.get('input[placeholder="Wählen Sie Enddatum und -uhrzeit"]').type('2025-03-21T12:00');

        cy.get('div[data-invalid="true"]').should('contain', 'Ungültige Endzeit');    
        cy.get('button').contains('Ereignis speichern').click();
        cy.get('#generalFormError').should('be.visible').should('contain', 'Bitte alle erforderlichen Felder ausfüllen.'); 
    });
});
