describe('template spec', () => {


  it('visit homepage', () => {
    cy.visit('http://localhost:3000')
  })

  it('navigate to Friendlist by clicking on Navigationbar', () => {

    cy.visit('http://localhost:3000')

    cy.get('#navbar')
        .find('a[href="/friendlist"]')
        .click();

      cy.url().should('include', '/friendlist');
  })

  it('should stay on friendlist when clicking the button again', () => {

    cy.visit('http://localhost:3000/friendlist')

    cy.get('#navbar')
        .find('a[href="/friendlist"]')
        .click();

    cy.url().should('include', '/friendlist');
  })

  it('should navigate back home', () => {

    cy.visit('http://localhost:3000/friendlist')

    cy.get('#navbar')
        .find('a[href="/"]')
        .click();

    cy.url().should('eq', 'http://localhost:3000/');
  })




})