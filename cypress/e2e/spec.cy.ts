describe('template spec', () => {

  it('should open the home page', () => {
    cy.visit('http://localhost:3000')
  })

  it('should direct to the next month ', () => {
    cy.visit('http://localhost:3000')
    
    cy.get('#e2eCalendar').get('button[data-slot="next-button"]').click()
    cy.get('#e2eCalendar').get('span[data-slot="title"]').contains('Februar 2025')
    cy.get('tbody[data-slot="grid-body"]').get('span[aria-label="Mittwoch, 19. Februar 2025"]').click()
    cy.get('td[aria-selected="true"').get('span[data-selected="true"]').get('span').contains('19')
  })
  
})