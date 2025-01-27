describe('Sign Up page Tests', () => {

    beforeEach(() => {
        cy.visit('http://localhost:3000/signup');
    });

    it('should render the sign up page', () => {
        cy.get('form').should('exist')
        cy.contains('Registrieren').should('exist');
        cy.contains('Erstelle ein neues Konto').should('exist');
        cy.get('input#username').should('exist');
        cy.get('input#email').should('exist');
        cy.get('input#password').should('exist');
        cy.get('input#password2').should('exist');
        cy.contains('button', 'Registrieren').should('exist');
        cy.contains('Du hast bereits ein Konto?').should('exist');
        cy.contains('Melde dich hier an').should('have.attr', 'href', 'signin');
    });

    it('should display error for missing fields', () => {
        cy.contains('button', 'Registrieren').click();
        cy.contains('Alle Felder sind erforderlich').should('exist');
    });

    it('should display error for password mismatch', () => {
        cy.get('input#username').type('newuser');
        cy.get('input#email').type('newuser@example.com');
        cy.get('input#password').type('password123');
        cy.get('input#password2').type('123password');
        cy.contains('button', 'Registrieren').click();
        cy.contains('Passwort stimmt nicht mit dem wiederholten Passwort überein').should('exist');
    });

    it('should display error if user already exists', () => {
        cy.intercept('POST', '/api/signup', {
            statusCode: 400,
            body: { message: 'Benutzer oder E-Mail existiert bereits.'},
        });
        cy.get('input#username').type('newuser');
        cy.get('input#email').type('newuser@example.com');
        cy.get('input#password').type('password123');
        cy.get('input#password2').type('password123');
        cy.contains('button', 'Registrieren').click();
        cy.contains('Benutzer oder E-Mail existiert bereits').should('exist');
    });

    it('should successfully sign up and redirect zo sign in page', () => {
        cy.intercept('POST', '/api/signup', {
            statusCode: 201,
            body: { message: 'Benutzer erfolgreich registriert.'},
        });
        cy.get('input#username').type('newuser');
        cy.get('input#email').type('newuser@example.com');
        cy.get('input#password').type('password123');
        cy.get('input#password2').type('password123');
        cy.contains('button', 'Registrieren').click();
        cy.url().should('eq', 'http://localhost:3000/signin')
    });

    it('should redirect to the sign-in page when the user already has an account', () => {
        cy.contains('Melde dich hier an').click();
        cy.url().should('eq', 'http://localhost:3000/signin');
    })

});