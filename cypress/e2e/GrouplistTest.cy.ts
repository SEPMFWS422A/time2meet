describe('Grouplist Tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/login');
        cy.get('input#email').type('K2@K2.com');
        cy.get('input#password').type('123');
        cy.contains('button', 'Anmelden').click();
        cy.url().should('eq', 'http://localhost:3000/');
    });


    it('should load and show the grouplist with groups', () => {
        cy.intercept('GET', '/api/groups', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    {_id: '1', groupname: 'Testgruppe', beschreibung: 'Test', members: ['User1'], isFavourite: false},
                    {
                        _id: '2',
                        groupname: 'Favoritengruppe',
                        beschreibung: 'Favorit',
                        members: ['User2'],
                        isFavourite: true
                    },
                ],
            },
        }).as('getGroups');
        cy.wait('@getGroups');

        cy.get('#groupList').should('exist');
        cy.get('#groupList').should(($groupList) => {
            expect($groupList.first()).to.contain('Favoritengruppe')
        });
        cy.get('#groupList').find("[id='groupListItem']").should('have.length', 2);

    });

    it('should show a message, if no groups exist', () => {
        cy.intercept('GET', '/api/groups', {
            statusCode: 200,
            body: {success: true, data: []},
        }).as('getEmptyGroups')

        cy.reload()
        cy.wait('@getEmptyGroups')

        cy.get('#noGroups').should('be.visible').and('contain', 'Du bist noch in keiner Gruppe')
    });

    it('should open and close the modal to add a group', () => {
        cy.get('#addGroup').should('exist');
        cy.get('#addGroup').click();
        cy.get('#modalHeader').should('be.visible').and('contain', 'Gruppe hinzufügen');

        cy.get('#closeButtonAddGroupModal').should('be.visible').click();
    });

    it('should add a new group and check if it shows up in the updated group list', () => {
        // Intercept API request and return a fake response
        cy.intercept('POST', '/api/groups', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    _id: 'test-id',
                    groupname: 'Neue Testgruppe',
                    beschreibung: 'Dies ist eine neue Testgruppe',
                    members: [],
                    isFavourite: false
                }
            }
        }).as('createGroup');

        // Intercept GET request to return a fake list of groups
        cy.intercept('GET', '/api/groups', (req) => {
            req.reply((res) => {
                res.send({
                    success: true,
                    data: [
                        {
                            _id: 'test-id',
                            groupname: 'Neue Testgruppe',
                            beschreibung: 'Dies ist eine neue Testgruppe',
                            members: [],
                            isFavourite: false
                        }
                    ]
                });
            });
        }).as('getGroups');

        // Open modal and add group
        cy.get('#addGroup').click();
        cy.get('[aria-label="Gruppenname"]').type('Neue Testgruppe');
        cy.get('[aria-label="Beschreibung"]').type('Dies ist eine neue Testgruppe');
        cy.get('#createGroupButtonAddGroupModal').click();

        // Wait for the intercepted request
        cy.wait('@createGroup');

        // Check if the new group appears in the list
        cy.get('#groupList').should('contain', 'Neue Testgruppe');
    });


    it("should mark a group as a favorite and update order", () => {
        cy.intercept("GET", "/api/groups", {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    {_id: "1", groupname: "Testgruppe", beschreibung: "Test", members: ["User1"], isFavourite: false},
                    {
                        _id: "2",
                        groupname: "Favoritengruppe",
                        beschreibung: "Favorit",
                        members: ["User2"],
                        isFavourite: false
                    }, // Startet als nicht favorisiert
                ],
            },
        }).as("getGroups");

        cy.intercept("POST", "/api/groups/favourite", (req) => {
            req.reply({
                statusCode: 200,
                body: {
                    success: true,
                    isFavourite: true, // Simuliert, dass die Gruppe favorisiert wurde
                },
            });
        }).as("postFavourite");

        cy.wait("@getGroups");

        // Sicherstellen, dass beide Gruppen geladen wurden
        cy.get("#groupList").find("[id='groupListItem']").should("have.length", 2);

        // Favoritengruppe sollte anfangs nicht favorisiert sein
        cy.get("#groupList").find("[id='groupListItem']").contains("Favoritengruppe").as("favGroup");
        cy.get("[aria-label='star_Favoritengruppe'] svg").should("have.attr", "fill", "none");

        // Klicke auf den Favoriten-Stern der Favoritengruppe
        cy.get("[aria-label='star_Favoritengruppe']").click();

        // Warte, bis die POST-Anfrage gesendet wurde
        cy.wait("@postFavourite");

        // Überprüfen, dass die Favoritengruppe jetzt favorisiert ist
        cy.get("[aria-label='star_Favoritengruppe'] svg").should("have.attr", "fill", "currentColor");

        // Überprüfen, ob die Favoritengruppe jetzt an erster Stelle steht
        cy.get("#groupList").find("[id='groupListItem']").first().should("contain.text", "Favoritengruppe");

    });

    it("should remove a group from favourites", () => {
        // Initiale Daten für die Gruppen mit einer favorisierten Gruppe
        cy.intercept("GET", "/api/groups", {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    {_id: "1", groupname: "Testgruppe", beschreibung: "Test", members: ["User1"], isFavourite: false},
                    {
                        _id: "2",
                        groupname: "Favoritengruppe",
                        beschreibung: "Favorit",
                        members: ["User2"],
                        isFavourite: true
                    }, // Startet als favorisiert
                ],
            },
        }).as("getGroups");

        cy.intercept("POST", "/api/groups/favourite", (req) => {
            const {groupId} = req.body;

            // Simuliere das Entfernen aus den Favoriten
            const isFavourite = groupId !== "2";

            req.reply({
                statusCode: 200,
                body: {
                    success: true,
                    isFavourite, // Favorit oder nicht
                },
            });
        }).as("postUnfavourite");

        cy.wait("@getGroups");

        // Sicherstellen, dass beide Gruppen geladen wurden
        cy.get("#groupList").find("[id='groupListItem']").should("have.length", 2);

        // Favoritengruppe sollte anfangs favorisiert sein
        cy.get("#groupList").find("[id='groupListItem']").contains("Favoritengruppe").as("favGroup");
        cy.get("[aria-label='star_Favoritengruppe'] svg").should("have.attr", "fill", "currentColor");

        // **Step 1: Entfernen aus den Favoriten**
        cy.get("[aria-label='star_Favoritengruppe']").click();

        // Warte, bis die POST-Anfrage gesendet wurde
        cy.wait("@postUnfavourite");

        // Überprüfen, dass die Favoritengruppe jetzt NICHT mehr favorisiert ist
        cy.get("[aria-label='star_Favoritengruppe'] svg").should("have.attr", "fill", "none");

    });

});
