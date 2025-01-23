describe('ProfilSettings Page Tests', () => {
  beforeEach(() => {
    // Besuche die ProfilSettings-Seite
    cy.visit('http://localhost:3000/manageprofile');
  });

  it('should load the ProfilSettings page', () => {
    cy.get('#header-title').should('be.visible').and('contain', 'Profil verwalten');
    cy.get('#header-description').should('be.visible').and('contain', 'Hier können Sie Ihre Profilinformationen ändern und anpassen.');
  });

  it('should allow the user to upload a profile picture', () => {
    cy.get('#profile-picture-input').selectFile('cypress/fixtures/test-image.png');
  });

  it('should allow the user to fill out the profile form', () => {
    cy.get('#first-name-input').type('Max');
    cy.get('#last-name-input').type('Mustermann');
    cy.get('#username-input').type('maxmustermann');
    cy.get('#email-input').type('max@example.com');
    cy.get('#password-input').type('Passwort123!');
    cy.get('#phone-input').type('0123456789');
    cy.get('#birth-date-input').type('2000-01-01');
    cy.get('#profile-visibility-input').select('Nur Freunde');
    cy.get('#calendar-visibility-input').select('Öffentlich');
    cy.get('#theme-input').select('Dunkel');
    cy.get('#save-changes').click();
  });

  it('should display and navigate to the privacy policy', () => {
    cy.get('#privacy-policy-link').should('be.visible').and('contain', 'Datenschutzrichtlinien anzeigen').click();
    cy.url().should('include', '/privacy');
  });
});
