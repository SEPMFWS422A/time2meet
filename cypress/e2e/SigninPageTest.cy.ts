describe('Sign In Page Tests', () => {

    beforeEach(() => {
        cy.visit('http://localhost:3000/signin');
    });

    it('should render the sign in page', () => {
        cy.get('#signInForm').should('exist');
        cy.contains('Anmelden').should('exist');
        cy.contains('Geben Sie Ihre daten ein, um sich in Ihrem time2meet Konto anzumelden').should('exist');
        cy.get('input#email').should('exist');
        cy.get('input#password').should('exist');
        cy.contains('button', 'Anmelden').should('exist')
        cy.contains('Du hast kein Konto?').should('exist');
        cy.contains('Bei time2meet registrieren').should('have.attr', 'href', 'signup');
    });

    it('should display error for empty email and password', () => {
        cy.contains('button', 'Anmelden').click();
        cy.contains('E-Mail und Passwort sind erforderlich.').should('exist');
    });

    it('should display error for invalid credentials', () => {
        cy.get('input#email').type('invalid@invalid.com');
        cy.get('input#password').type('invalid');
        cy.contains('button', 'Anmelden').click();
        cy.contains('Ungültige Anmeldedaten').should('exist');
        cy.get('input#password').should('have.value', '');
    });

    it('should log in successfully with valid credentials', () => {
        cy.get('input#email').type('john.doe@example.com');
        cy.get('input#password').type('password123');
        cy.contains('button', 'Anmelden').click();
        cy.url().should('eq', 'http://localhost:3000/');
    });

    it('should handle server error gracefully', () => {
        // cy.intercept ist verwendet um HTTP-Anfragen zu simulieren
        cy.intercept('POST', '/api/signin', {
            statusCode: 500,
            body: { message: 'Serverfehler, Bitte versuchen Sie es später erneut.'},
        });
        cy.get('input#email').type('john.doe@example.com');
        cy.get('input#password').type('password123');
        cy.contains('button', 'Anmelden').click();
        cy.contains('Serverfehler, Bitte versuchen Sie es später erneut.').should('exist');
    })
    
});