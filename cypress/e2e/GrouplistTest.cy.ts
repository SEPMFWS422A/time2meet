describe('Grouplist Tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/login');
        cy.get('input#email').type('cypress@test.de');
        cy.get('input#password').type('123');
        cy.contains('button', 'Anmelden').click();
        cy.url().should('eq', 'http://localhost:3000/');
    });

    it('should navigate to the homepage, create a new group while forgetting to type in the group and favors the new group', () => {
        const gruppenName = "Testgruppe " + Date.now();
        cy.get('#navbar').find("[id=Home]").click();
        cy.url().should('include', '/');

        cy.get("#tabOptions").find("[id='tabOption']").contains("Gruppen").should("be.visible");
        cy.get('#tabOptions').find("[id='tabOption']").contains("Freunde").should("be.visible");
        cy.get('#addGroup').contains("Neue Gruppe hinzufügen").should("be.visible");

        cy.get('#addGroup').click();
        cy.get('#addGroupModal').should('be.visible');
        cy.get('[aria-label="Gruppenname"]').clear();
        cy.get('[aria-label="Beschreibung"]').type('Dies ist Gruppe ' + gruppenName);
        cy.get('#createGroupButtonAddGroupModal').click();
        cy.contains('Sie müssen einen Gruppennamen angeben.').should('be.visible');
        cy.get('[aria-label="Gruppenname"]').type(gruppenName);
        cy.get('#createGroupButtonAddGroupModal').click();
        cy.get('#addGroupModal').should('be.visible');
        cy.contains(gruppenName).should('exist');
        cy.get("[aria-label='star_" + gruppenName + "'] svg").should("have.attr", "fill", "none");
        cy.get("[aria-label='star_" + gruppenName + "'] svg").click();
        cy.get("[aria-label='star_" + gruppenName + "'] svg").should("have.attr", "fill", "currentColor");
    });

    it('should show a message, the user is not in a group yet', () => {
        cy.intercept('GET', '/api/groups', {
            statusCode: 200,
            body: {success: true, data: []},
        }).as('getEmptyGroups')

        cy.reload()
        cy.wait('@getEmptyGroups')

        cy.get('#noGroups').should('be.visible').and('contain', 'Du bist noch in keiner Gruppe.')
    });
});
