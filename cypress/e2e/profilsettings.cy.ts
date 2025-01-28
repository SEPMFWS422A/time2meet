describe('Profile Settings Page Tests', () => {
  beforeEach(() => {
    // Visit the Profile Settings page
    cy.visit('http://localhost:3000/manageprofile');
  });

  it('should load Information about Profilsettings', () => {
    cy.get('#header-title').should('be.visible').and('contain', 'Profil verwalten');
    cy.get('#header-description').should('be.visible').and('contain', 'Hier können Sie Ihre Profilinformationen ändern und anpassen.');
  });

  it('should allow the user to upload a valid profile picture', () => {
    cy.get('#profile-picture-input').selectFile('cypress/fixtures/test-image.png');
  });

  it('should show an error message when an invalid file is uploaded', () => {
    cy.get('#profile-picture-input').selectFile('cypress/fixtures/test-pdf.pdf');
    cy.get('p').contains('Nur Bilddateien sind erlaubt.').should('be.visible');
  });

  it('should prevent form submission if the birth date is in the future', () => {
    cy.get('#birth-date-input').type('2100-01-01');
    cy.get('p').contains('Das Geburtsdatum darf nicht nach dem aktuellen Datum liegen.').should('be.visible');
    cy.get('#save-changes').should('be.disabled');
  });

  it('should navigate to the privacy policy page', () => {
    cy.get('#privacy-policy-link').should('be.visible').and('contain', 'Datenschutzrichtlinien anzeigen').click();
    cy.url().should('include', '/privacy-policy');
  });

  it('should show error messages dynamically as the user interacts', () => {
    cy.get('#birth-date-input').type('2100-01-01');
    cy.get('p').contains('Das Geburtsdatum darf nicht nach dem aktuellen Datum liegen.').should('be.visible');
    cy.get('#birth-date-input').clear().type('2000-01-01');
    cy.get('#phone-input').type('abc123');
    cy.get('p').contains('Bitte geben Sie eine gültige Telefonnummer ein.').should('be.visible');
    cy.get('#save-changes').should('be.disabled');
  });

  it('should allow the user to correctly fill out the profile form', () => {
    cy.get('#first-name-input').type('Max');
    cy.get('#last-name-input').type('Mustermann');
    cy.get('#username-input').type('maxmustermann');
    cy.get('#email-display').should('contain', 'Test@gmail.com');
    cy.get('#password-input').type('Password123!');
    cy.get('#phone-input').type('0123456789');
    cy.get('#birth-date-input').type('2000-01-01');
    cy.get('#profile-visibility-input').select('Nur Freunde');
    cy.get('#calendar-visibility-input').select('Nur Freunde');
    cy.get('#theme-input').select('Dunkel');
    cy.get('#save-changes').click();
  });
});
