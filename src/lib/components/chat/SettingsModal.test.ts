import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const source = readFileSync(resolve(__dirname, 'SettingsModal.svelte'), 'utf-8');

const SYSTEM_TAB_IDS = [
	'system',
	'backend_connections',
	'models',
	'evaluations',
	'tool_servers',
	'documents',
	'web_search',
	'code_execution',
	'interface_defaults',
	'audio_backends',
	'images',
	'pipelines',
	'database'
] as const;

const ADMIN_COMPONENTS = [
	'AdminGeneral',
	'AdminConnections',
	'AdminModels',
	'AdminEvaluations',
	'AdminTools',
	'AdminDocuments',
	'AdminWebSearch',
	'AdminCodeExecution',
	'AdminInterface',
	'AdminAudio',
	'AdminImages',
	'AdminPipelines',
	'AdminDatabase'
] as const;

describe('SettingsModal — system tabs folded in', () => {
	describe('allSettings contains all system tab IDs', () => {
		SYSTEM_TAB_IDS.forEach((id) => {
			it(`includes tab id: ${id}`, () => {
				expect(source).toContain(`id: '${id}'`);
			});
		});
	});

	describe('tab buttons exist for each system tab', () => {
		SYSTEM_TAB_IDS.forEach((id) => {
			it(`has a tab button for: ${id}`, () => {
				expect(source).toContain(`tabId === '${id}'`);
			});
		});
	});

	describe('content panels exist for each system tab', () => {
		SYSTEM_TAB_IDS.forEach((id) => {
			it(`has a content panel for: ${id}`, () => {
				expect(source).toContain(`selectedTab === '${id}'`);
			});
		});
	});

	describe('admin components are imported', () => {
		ADMIN_COMPONENTS.forEach((component) => {
			it(`imports ${component}`, () => {
				expect(source).toContain(`import ${component} from`);
			});
		});
	});

	describe('admin components are rendered in content panels', () => {
		ADMIN_COMPONENTS.forEach((component) => {
			it(`renders <${component}`, () => {
				expect(source).toContain(`<${component}`);
			});
		});
	});

	it('getBackendConfig is imported', () => {
		expect(source).toContain('getBackendConfig');
	});

	it('Admin Settings link has been removed', () => {
		expect(source).not.toContain('Admin Settings');
		expect(source).not.toContain('href="/admin/settings"');
	});
});

describe('Admin settings routes redirect to home', () => {
	const settingsPage = readFileSync(
		resolve(__dirname, '../../../../routes/(app)/admin/settings/+page.svelte'),
		'utf-8'
	);
	const tabPage = readFileSync(
		resolve(__dirname, '../../../../routes/(app)/admin/settings/[tab]/+page.svelte'),
		'utf-8'
	);

	it('/admin/settings redirects to /', () => {
		expect(settingsPage).toContain("goto('/')");
		expect(settingsPage).not.toContain('/admin/settings');
	});

	it('/admin/settings/[tab] redirects to /', () => {
		expect(tabPage).toContain("goto('/')");
		expect(tabPage).not.toContain('Settings');
	});
});
