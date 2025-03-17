describe("SurveyList Tests", () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/login');
        cy.get('input#email').type('cypress@test.de');
        cy.get('input#password').type('123');
        cy.contains('button', 'Anmelden').click();
        cy.url().should('eq', 'http://localhost:3000/');
    });

    it("should display the correct tabs and the survey creation button", () => {
        cy.get('#navbar').find("[id=Umfragen]").click();
        cy.url().should('include', '/surveylist');
        cy.get("#tabOptions").find("[id='tabOption']").contains("Selbsterstellte Umfragen").should("be.visible");
        cy.get('#tabOptions').find("[id='tabOption']").contains("Erhaltene Umfragen").should("be.visible");
        cy.contains("Umfrage erstellen").should("be.visible");
        cy.contains("Umfrage erstellen").click();
        cy.get("#createMultiplechoiceForm").should("be.visible");
        cy.get("#createSchedulingForm").should("be.visible");
        cy.get("#titel").type("Test Titel");
        cy.get("#beschreibung").type("Test Beschreibung");
        cy.get("#ort").type("Test Ort");
        cy.get("#Option0").type("Test Option1");
        cy.get("#plusOption").click();
        cy.get("#Option1").type("Test Option2");
        cy.get("#plusOption").click();
        cy.get("#Option2").type("Test Option3");
        cy.get("[data-day=" + new Date().toISOString().split('T')[0] + "]").click();
        cy.get("#uhrzeitVon").type("1245");
        cy.get("#uhrzeitBis").type("1500");
        cy.get('button').contains("Abschicken").should("be.visible").click();
        cy.contains("Test Titel").should("be.visible");
    });

    it("should show a message there are no surveys", () => {
        cy.visit("http://localhost:3000/surveylist");
        cy.intercept("GET", "/api/surveys/participating", {
            statusCode: 200,
            body: [],
        }).as("getEmptySurveys");

        cy.wait("@getEmptySurveys");

        cy.contains("Du hast noch keine Umfragen.").should("be.visible");
    });
});
