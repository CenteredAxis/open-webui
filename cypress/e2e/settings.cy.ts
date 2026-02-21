// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../support/index.d.ts" />
import { adminUser } from '../support/e2e';

// These tests run through the various settings pages, ensuring that the user can interact with them as expected
describe('Settings', () => {
	// Wait for 2 seconds after all tests to fix an issue with Cypress's video recording missing the last few frames
	after(() => {
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.wait(2000);
	});

	beforeEach(() => {
		// Login as the admin user
		cy.loginAdmin();
		// Visit the home page
		cy.visit('/');
		// Click on the user menu
		cy.get('button[aria-label="User Menu"]').click();
		// Click on the settings link
		cy.get('button').contains('Settings').click();
	});

	context('General', () => {
		it('user can open the General modal and hit save', () => {
			cy.get('button').contains('General').click();
			cy.get('button').contains('Save').click();
		});
	});

	context('Interface', () => {
		it('user can open the Interface modal and hit save', () => {
			cy.get('button').contains('Interface').click();
			cy.get('button').contains('Save').click();
		});
	});

	context('Audio', () => {
		it('user can open the Audio modal and hit save', () => {
			cy.get('button').contains('Audio').click();
			cy.get('button').contains('Save').click();
		});
	});

	context('Chats', () => {
		it('user can open the Chats modal', () => {
			cy.get('button').contains('Chats').click();
		});
	});

	context('Account', () => {
		it('user can open the Account modal and hit save', () => {
			cy.get('button').contains('Account').click();
			cy.get('button').contains('Save').click();
		});
	});

	context('About', () => {
		it('user can open the About modal', () => {
			cy.get('button').contains('About').click();
		});
	});

	// System tabs (formerly admin-only settings)
	context('System tabs are visible and selectable', () => {
		const systemTabs = [
			'System',
			'Backend Connections',
			'Models',
			'Evaluations',
			'Tool Servers',
			'Documents',
			'Web Search',
			'Code Execution',
			'Interface Defaults',
			'Audio Backends',
			'Images',
			'Pipelines',
			'Database'
		] as const;

		it('all system tabs appear in the settings modal', () => {
			for (const tab of systemTabs) {
				cy.get('button[role="tab"]').contains(tab).should('exist');
			}
		});

		systemTabs.forEach((tab) => {
			it(`user can click the ${tab} tab`, () => {
				cy.get('button[role="tab"]').contains(tab).click();
				cy.get('button[role="tab"]').contains(tab).should('have.attr', 'aria-selected', 'true');
			});
		});
	});

	context('System tab save buttons', () => {
		it('System tab has a save button', () => {
			cy.get('button[role="tab"]').contains('System').click();
			cy.get('button').contains('Save').should('exist');
		});

		it('Backend Connections tab has a save button', () => {
			cy.get('button[role="tab"]').contains('Backend Connections').click();
			cy.get('button').contains('Save').should('exist');
		});

		it('Documents tab has a save button', () => {
			cy.get('button[role="tab"]').contains('Documents').click();
			cy.get('button').contains('Save').should('exist');
		});

		it('Web Search tab has a save button', () => {
			cy.get('button[role="tab"]').contains('Web Search').click();
			cy.get('button').contains('Save').should('exist');
		});

		it('Audio Backends tab has a save button', () => {
			cy.get('button[role="tab"]').contains('Audio Backends').click();
			cy.get('button').contains('Save').should('exist');
		});

		it('Images tab has a save button', () => {
			cy.get('button[role="tab"]').contains('Images').click();
			cy.get('button').contains('Save').should('exist');
		});
	});

	context('Admin Settings link is removed', () => {
		it('the settings modal does not contain an Admin Settings link', () => {
			cy.contains('Admin Settings').should('not.exist');
		});
	});
});

describe('Admin settings redirect', () => {
	beforeEach(() => {
		cy.loginAdmin();
	});

	it('/admin/settings redirects to home', () => {
		cy.visit('/admin/settings');
		cy.url().should('eq', Cypress.config().baseUrl + '/');
	});

	it('/admin/settings/general redirects to home', () => {
		cy.visit('/admin/settings/general');
		cy.url().should('eq', Cypress.config().baseUrl + '/');
	});
});
