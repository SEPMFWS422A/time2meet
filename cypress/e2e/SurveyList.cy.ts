import mockSurveys from "./mockTestData/mockSurveys";
import mockUser from "./mockTestData/mockUser";

describe("SurveyList Tests", () => {
    beforeEach(() => {
        cy.intercept("POST", "/api/userauth/login", {
            statusCode: 200,
            body: {
                message: "Login successful",
                success: true,
            },
            headers: {
                "Set-Cookie": "token=mockToken123; Path=/; HttpOnly",
            },
        }).as("login");

        cy.intercept("GET", "/api/userauth/decode", {
            statusCode: 200,
            body: {id: mockUser._id, email: mockUser.email},
        }).as("getUser");

        cy.intercept("GET", "/api/surveys/participating", {
            statusCode: 200,
            body: mockSurveys,
        }).as("getSurveys");

        cy.visit("http://localhost:3000/login");
        cy.get("input#email").type(mockUser.email);
        cy.get("input#password").type(mockUser.password);
        cy.contains("button", "Anmelden").click();
        cy.wait("@login");
        cy.wait("@getUser");
    });

    it("should display the correct tabs and the survey creation button", () => {
        cy.visit("http://localhost:3000/surveylist");
        cy.wait("@getSurveys");
        cy.get("#tabOptions").find("[id='tabOption']").contains("Selbsterstellte Umfragen").should("be.visible");
        cy.get('#tabOptions').find("[id='tabOption']").contains("Erhaltene Umfragen").should("be.visible");
        cy.contains("Umfrage erstellen").should("be.visible");
    });

    it("should show all surveys correctly categorized by user status", () => {
        cy.visit("http://localhost:3000/surveylist");
        cy.wait("@getSurveys");
        cy.contains("Selbsterstellte Umfragen").click();
        cy.get("#surveyList").should("exist");
        cy.get("#surveyList").find("[id=surveyListItem]").should("have.length", 2);
        cy.contains("Wanderung in den Bergen").should("be.visible");
        cy.contains("Spieleabend").should("not.exist");

        cy.contains("Erhaltene Umfragen").click();
        cy.get("#surveyList").should("exist");
        cy.get("#surveyList").find("[id=surveyListItem]").should("have.length", 1);
        cy.contains("Spieleabend").should("be.visible");
        cy.contains("Wanderung in den Bergen").should("not.exist");
    });

    it("should show an error message if surveys fail to load", () => {
        cy.visit("http://localhost:3000/surveylist");
        cy.wait("@getSurveys");
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
