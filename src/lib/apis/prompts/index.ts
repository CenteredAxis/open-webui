import { fetchAPI } from '$lib/utils/api';

type PromptItem = {
	id?: string; // Prompt ID
	command: string;
	name: string; // Changed from title
	content: string;
	data?: object | null;
	meta?: object | null;
	access_grants?: object[];
	version_id?: string | null; // Active version
	commit_message?: string | null; // For history tracking
	is_production?: boolean; // Whether to set new version as production
};

type PromptHistoryItem = {
	id: string;
	prompt_id: string;
	parent_id: string | null;
	snapshot: {
		name: string;
		content: string;
		command: string;
		data: object;
		meta: object;
		access_grants: object[];
	};
	user_id: string;
	commit_message: string | null;
	created_at: number;
	user?: {
		id: string;
		name: string;
		email: string;
	};
};

type PromptDiff = {
	from_id: string;
	to_id: string;
	from_snapshot: object;
	to_snapshot: object;
	content_diff: string[];
	name_changed: boolean;
	access_grants_changed: boolean;
};

export const createNewPrompt = async (token: string, prompt: PromptItem) =>
	fetchAPI('/prompts/create', {
		method: 'POST',
		token,
		body: {
			...prompt,
			command: prompt.command.startsWith('/') ? prompt.command.slice(1) : prompt.command
		}
	});

export const getPrompts = async (token: string = '') => fetchAPI('/prompts/', { token });

export const getPromptTags = async (token: string = '') => fetchAPI('/prompts/tags', { token });

export const getPromptItems = async (
	token: string = '',
	query: string | null,
	viewOption: string | null,
	selectedTag: string | null,
	orderBy: string | null,
	direction: string | null,
	page: number
) =>
	fetchAPI('/prompts/list', {
		token,
		params: {
			query,
			view_option: viewOption,
			tag: selectedTag,
			order_by: orderBy,
			direction,
			page
		}
	});

export const getPromptList = async (token: string = '') => fetchAPI('/prompts/list', { token });

export const getPromptByCommand = async (token: string, command: string) => {
	command = command.charAt(0) === '/' ? command.slice(1) : command;
	return fetchAPI(`/prompts/command/${command}`, { token });
};

export const getPromptById = async (token: string, promptId: string) =>
	fetchAPI(`/prompts/id/${promptId}`, { token });

export const updatePromptById = async (token: string, prompt: PromptItem) =>
	fetchAPI(`/prompts/id/${prompt.id}/update`, { method: 'POST', token, body: prompt });

export const updatePromptMetadata = async (
	token: string,
	promptId: string,
	name: string,
	command: string,
	tags: string[] = []
) =>
	fetchAPI(`/prompts/id/${promptId}/update/meta`, {
		method: 'POST',
		token,
		body: { name, command, tags }
	});

export const setProductionPromptVersion = async (
	token: string,
	promptId: string,
	version_id: string
) =>
	fetchAPI(`/prompts/id/${promptId}/update/version`, {
		method: 'POST',
		token,
		body: { version_id }
	});

export const deletePromptById = async (token: string, promptId: string) =>
	fetchAPI(`/prompts/id/${promptId}/delete`, { method: 'DELETE', token });

export const updatePromptAccessGrants = async (
	token: string,
	promptId: string,
	accessGrants: any[]
) =>
	fetchAPI(`/prompts/id/${promptId}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});

////////////////////////////
// Prompt History APIs
////////////////////////////

export const getPromptHistory = async (
	token: string,
	promptId: string,
	page: number = 0
): Promise<PromptHistoryItem[]> =>
	fetchAPI(`/prompts/id/${promptId}/history`, { token, params: { page } });

export const deletePromptHistoryVersion = async (
	token: string,
	promptId: string,
	historyId: string
): Promise<boolean> =>
	fetchAPI(`/prompts/id/${promptId}/history/${historyId}`, { method: 'DELETE', token });

export const getPromptHistoryEntry = async (
	token: string,
	promptId: string,
	historyId: string
): Promise<PromptHistoryItem> =>
	fetchAPI(`/prompts/id/${promptId}/history/${historyId}`, { token });

export const restorePromptFromHistory = async (
	token: string,
	promptId: string,
	historyId: string,
	commitMessage?: string
) =>
	fetchAPI(`/prompts/id/${promptId}/history/${historyId}/restore`, {
		method: 'POST',
		token,
		body: { commit_message: commitMessage }
	});

export const getPromptDiff = async (
	token: string,
	promptId: string,
	fromId: string,
	toId: string
): Promise<PromptDiff> =>
	fetchAPI(`/prompts/id/${promptId}/history/diff`, {
		token,
		params: { from_id: fromId, to_id: toId }
	});
