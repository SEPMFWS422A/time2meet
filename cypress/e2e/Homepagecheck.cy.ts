beforeEach(() => {
  cy.visit('http://localhost:3000');

        cy.get('input#email').type('E2EUser@gmx.de');
        cy.get('input#password').type('123');
        cy.contains('button', 'Anmelden').click();
        cy.url().should('eq', 'http://localhost:3000/');
});

describe('Homepagecheck', () => {

  it('should initializes Calendar with month view and days visible', () => {

    cy.get('#HomePageLayout')
      .find('.fc-dayGridMonth-view') 
      .should('be.visible'); 
  });

  it('should turn to week grid view on week-button click', ()=>{


    cy.get('#HomePageLayout').find('button.fc-timeGridWeek-button').click();

    cy.get('#HomePageLayout')
      .find('.fc-timeGridWeek-view') 
      .should('be.visible'); 
  })

  it('should turn to day grid view on day-button click', ()=>{


    cy.get('#HomePageLayout').find('button.fc-timeGridDay-button').click();

    cy.get('#HomePageLayout')
      .find('.fc-timeGridDay-view') 
      .should('be.visible'); 
  })

  it('should turn to list grid view on list-button click', ()=>{

    cy.get('#HomePageLayout').find('button.fc-listWeek-button').click();

    cy.get('#HomePageLayout')
      .find('.fc-listWeek-view') 
      .should('be.visible'); 
  })
  
})