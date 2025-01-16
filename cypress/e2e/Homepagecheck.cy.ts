describe('Homepagecheck', () => {

  it('should open the home page', () => {
    cy.visit('http://localhost:3000')
  })


  it('should initializes Calendar with month view and days visible', () => {
    cy.visit('http://localhost:3000'); 

    cy.get('#HomePageLayout')
      .find('.fc-dayGridMonth-view') 
      .should('be.visible'); 
  });

  it('should turn to week grid view on week-button click', ()=>{

    cy.visit('http://localhost:3000'); 

    cy.get('#HomePageLayout').find('button[title="week view"]').click();

    cy.get('#HomePageLayout')
      .find('.fc-timeGridWeek-view') 
      .should('be.visible'); 
  })

  it('should turn to day grid view on day-button click', ()=>{

    cy.visit('http://localhost:3000'); 

    cy.get('#HomePageLayout').find('button[title="day view"]').click();

    cy.get('#HomePageLayout')
      .find('.fc-timeGridDay-view') 
      .should('be.visible'); 
  })

  it('should turn to list grid view on list-button click', ()=>{

    cy.visit('http://localhost:3000'); 

    cy.get('#HomePageLayout').find('button[title="list view"]').click();

    cy.get('#HomePageLayout')
      .find('.fc-listWeek-view') 
      .should('be.visible'); 
  })
  
})