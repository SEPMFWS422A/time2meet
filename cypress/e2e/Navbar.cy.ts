beforeEach(() => {
  // Besuche die lokale Anwendung vor jedem Test
  cy.visit('http://localhost:3000');
});


describe('template spec', () => {


  it('visit homepage', () => {
  })

  it('navigate to Friendlist by clicking on Navigationbar', () => {


    cy.get('#navbar')
        .find('a[href="/friendlist"]')
        .click();

      cy.url().should('include', '/friendlist');
  })

  it('should stay on friendlist when clicking the button again', () => {


    cy.get('#navbar')
        .find('a[href="/friendlist"]')
        .click();

    cy.url().should('include', '/friendlist');
  })

  it('should navigate back home', () => {


    cy.get('#navbar')
        .find('a[href="/"]')
        .click();

    cy.url().should('eq', 'http://localhost:3000/');
  })




})