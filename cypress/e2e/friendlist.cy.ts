describe('Friends Page', () => {
    const time = 4500;

    function removeAllFriends() {
        cy.contains('Freunde').click();
        cy.wait(time);
        
        const removeNextFriend = () => {
            cy.get('body').then($body => {
                if ($body.find('[data-testid="no-friends-message"]').length > 0) {
                    return;
                }
                
                if ($body.find('[id="remove-friend"]').length > 0) {
                    cy.get('[id="remove-friend"]').first().click();
                    cy.on('window:confirm', () => true); 
                    cy.wait(time);
                    removeNextFriend();
                }
            });
        };
        
        removeNextFriend();
    }

    function addFriend() {
        cy.wait(time);
        
        const addAllFoundFriends = () => {
            cy.get('body').then($body => {
                const addFriendButtons = $body.find('[id="add-friend"]');
                if (addFriendButtons.length === 0) {
                    return;
                }
                cy.get('[id="add-friend"]').first().should('be.visible').click();
                
                cy.wait(1000).then(() => {
                    cy.get('body').then(() => {
                        cy.wait(1500);
                        addAllFoundFriends();
                    });
                });
            });
        };
        
        addAllFoundFriends();
    }

    beforeEach(() => {
        cy.visit('http://localhost:3000/login');
        cy.get('#email').type('K2@K2.com');
        cy.get('#password').type('123');
        cy.contains('button', 'Anmelden').click();
    });

    it('should add a friend', () => {
        cy.wait(time);
        cy.contains('Freunde').should('be.visible').click();
        cy.wait(500);
        cy.get('[id="add-friend-button"]').should('be.visible').click();
        cy.get('#Freundessuche').should('be.visible').type('user');
        cy.wait(time);
        
        addFriend();
        
        cy.wait(time);
    });

    it('should remove all friends', () => {
        cy.wait(time);
        cy.contains('Freunde').should('be.visible').click();
        cy.wait(500);
        removeAllFriends();
    });

    it('should show no friends message', () => {
        cy.wait(time);
        cy.contains('Freunde').should('be.visible').click();
        cy.wait(500);
        cy.contains('Du hast keine Freunde').should('be.visible');
    });
    

});