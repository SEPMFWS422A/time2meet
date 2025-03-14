
describe('GroupPage E2E Tests', () => {
    it('should display the correct group members for the first dataset', () => {
        // Annahme: Die erste Gruppe hat die ID '1'
        cy.visit('localhost:3000/groupdetails/1');

        // Überprüfe den Gruppennamen
        cy.contains('Entwickler Gruppe').should('be.visible');

        // Überprüfe die Teilnehmerliste
        const expectedMembers = [
            'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hannah', 'Igor', 'Jack'
        ];

        cy.get('aside ul li').each(($li, index) => {
            cy.wrap($li).should('contain', expectedMembers[index]);
        });

        // Überprüfe die Anzahl der Teilnehmer
        cy.get('aside ul li').should('have.length', expectedMembers.length);
    });
});