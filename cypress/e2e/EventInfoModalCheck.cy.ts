import { events } from '../../src/app/api/event/route';

beforeEach(() => {
    // Besuche die lokale Anwendung vor jedem Test
    cy.visit('http://localhost:3000');
});

describe('Event Info Modal E2E Tests', () => {

    events.forEach((event) => {
        it(`should open and display the correct modal information for event: ${event.title}`, () => {

            cy.get('.fc-event').contains(event.title as string).should('be.visible');

            cy.get('.fc-event').contains(event.title as string).click();

            cy.get('#eventInfoModal').should('have.attr', 'data-is-open', 'true');

            cy.get('#eventInfoTitle').should('contain', event.title);

            cy.get('#eventInfoDescription').should('contain', event.description || 'Keine Beschreibung verfügbar');

            cy.get('#eventInfoLocation').should('contain', event.location || 'N/A');

            cy.get('#eventInfoCloseButton').click();

            cy.get('#eventInfoModal').should('not.exist');
        });

        it(`should correctly format the event time for event: ${event.title}`, () => {

            cy.get('.fc-event').contains(event.title as string).click();

            const startDate = new Date(event.start as string);
            const endDate = event.end ? new Date(event.end as string) : null;
            let expectedTime;

            if (event.allDay) {
                expectedTime = `${startDate.toLocaleDateString()} (Ganztägig)`;
            } else {
                const formatTime = (date: any) =>
                    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const startDateFormatted = startDate.toLocaleDateString();
                const endDateFormatted = endDate ? endDate.toLocaleDateString() : null;

                if (endDate && startDateFormatted === endDateFormatted) {
                    expectedTime = `${startDateFormatted} von ${formatTime(startDate)} bis ${formatTime(endDate)}`;
                } else if (endDate) {
                    expectedTime = `Von ${startDateFormatted} um ${formatTime(startDate)} bis ${endDateFormatted} um ${formatTime(endDate)}`;
                } else {
                    expectedTime = `${startDateFormatted} um ${formatTime(startDate)}`;
                }
            }

            cy.get('#eventInfoTimePeriod').should('contain', expectedTime);

            cy.get('#eventInfoCloseButton').click();

            cy.get('#eventInfoModalPopup').should('not.exist');
        });
    });
});
