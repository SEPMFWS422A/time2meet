// cypress/e2e/createSurvey.cy.js

beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('input#email').type('K2@K2.com');
    cy.get('input#password').type('123');
    cy.contains('button', 'Anmelden').click();
    cy.url().should('eq', 'http://localhost:3000/');
});

describe('CreateSurvey E2E Tests', () => {
    it('should add options to the CreateMultipleChoiceSurvey component', () => {
        cy.visit('http://localhost:3000/surveylist');

        cy.get('#createSurveyButton button').click();


        cy.get('input[name="Titel"]').type('Test Survey Title');
        cy.get('input[name="description"]').type('Test Survey Description');
        cy.get('input[name="Ort"]').type('Test Location');

        // Füge Optionen hinzu
        cy.get('input[aria-label="Option"]').first().type('Option 1');
        cy.get('button[aria-label="Option hinzufügen"]').click();
        cy.get('input[aria-label="Option"]').last().type('Option 2');

        // Überprüfe, ob die Optionen hinzugefügt wurden
        cy.get('input[aria-label="Option"]').should('have.length', 2);
        cy.get('input[aria-label="Option"]').first().should('have.value', 'Option 1');
        cy.get('input[aria-label="Option"]').last().should('have.value', 'Option 2');

        cy.get('button[aria-label="abschicken"]').click();

    });

});