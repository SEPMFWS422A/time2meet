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

    // it("should show all surveys correctly categorized by user status", () => {
    //     cy.visit("http://localhost:3000/surveylist");
    //     cy.contains("Selbsterstellte Umfragen").click();
    //     cy.get("#surveyList").should("exist");
    //     cy.get("#surveyList").find("[id=surveyListItem]").should("have.length", 2);
    //     cy.contains("Wanderung in den Bergen").should("be.visible");
    //     cy.contains("Spieleabend").should("not.exist");
    //
    //     cy.contains("Erhaltene Umfragen").click();
    //     cy.get("#surveyList").should("exist");
    //     cy.get("#surveyList").find("[id=surveyListItem]").should("have.length", 1);
    //     cy.contains("Spieleabend").should("be.visible");
    //     cy.contains("Wanderung in den Bergen").should("not.exist");
    // });

    it("should show an error message if surveys fail to load", () => {
        cy.visit("http://localhost:3000/surveylist");
        cy.intercept("GET", "/api/surveys/participating", {
            statusCode: 500,
            body: {error: "Error loading surveys"},
        }).as("getSurveysError");

        cy.visit("http://localhost:3000/surveylist");
        cy.wait("@getSurveysError");

        cy.contains("Es gab ein Problem beim Laden der Umfragen.").should("be.visible");
    });

    it("should show a message there are no surveys", () => {
        cy.visit("http://localhost:3000/surveylist");
        cy.intercept("GET", "/api/surveys/participating", {
            statusCode: 200,
            body: [],
        }).as("getEmptySurveys");

        cy.wait("@getEmptySurveys");

        cy.contains("Keine Umfragen vorhanden.").should("be.visible");
    });
});
