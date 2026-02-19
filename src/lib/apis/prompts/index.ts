import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

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

export const createNewPrompt = (token: string, prompt: PromptItem) =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/create`, {
		method: 'POST',
		token,
		body: {
			...prompt,
			command: prompt.command.startsWith('/') ? prompt.command.slice(1) : prompt.command
		}
	});

export const getPrompts = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/`, { token });

export const getPromptTags = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/tags`, { token });

export const getPromptItems = (
	token: string = '',
	query: string | null,
	viewOption: string | null,
	selectedTag: string | null,
	orderBy: string | null,
	direction: string | null,
	page: number
) => {
	const searchParams = new URLSearchParams();
	if (query) {
		searchParams.append('query', query);
	}
	if (viewOption) {
		searchParams.append('view_option', viewOption);
	}
	if (selectedTag) {
		searchParams.append('tag', selectedTag);
	}
	if (orderBy) {
		searchParams.append('order_by', orderBy);
	}
	if (direction) {
		searchParams.append('direction', direction);
	}
	if (page) {
		searchParams.append('page', page.toString());
	}

	return apiFetch(`${WEBUI_API_BASE_URL}/prompts/list?${searchParams.toString()}`, { token });
};

export const getPromptList = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/list`, { token });

export const getPromptByCommand = (token: string, command: string) => {
	command = command.charAt(0) === '/' ? command.slice(1) : command;
	return apiFetch(`${WEBUI_API_BASE_URL}/prompts/command/${command}`, { token });
};

export const getPromptById = (token: string, promptId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}`, { token });

export const updatePromptById = (token: string, prompt: PromptItem) =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/id/${prompt.id}/update`, {
		method: 'POST',
		token,
		body: prompt as unknown as Record<string, unknown>
	});

export const updatePromptMetadata = (
	token: string,
	promptId: string,
	name: string,
	command: string,
	tags: string[] = []
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/update/meta`, {
		method: 'POST',
		token,
		body: { name, command, tags }
	});

export const setProductionPromptVersion = (
	token: string,
	promptId: string,
	version_id: string
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/update/version`, {
		method: 'POST',
		token,
		body: { version_id }
	});

export const deletePromptById = (token: string, promptId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/delete`, { method: 'DELETE', token });

export const updatePromptAccessGrants = (
	token: string,
	promptId: string,
	accessGrants: any[]
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});

////////////////////////////
// Prompt History APIs
////////////////////////////

export const getPromptHistory = (
	token: string,
	promptId: string,
	page: number = 0
): Promise<PromptHistoryItem[]> =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/history?page=${page}`, { token });

export const deletePromptHistoryVersion = (
	token: string,
	promptId: string,
	historyId: string
): Promise<boolean> =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/history/${historyId}`, {
		method: 'DELETE',
		token
	});

export const getPromptHistoryEntry = (
	token: string,
	promptId: string,
	historyId: string
): Promise<PromptHistoryItem> =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/history/${historyId}`, { token });

export const restorePromptFromHistory = (
	token: string,
	promptId: string,
	historyId: string,
	commitMessage?: string
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/history/${historyId}/restore`, {
		method: 'POST',
		token,
		body: { commit_message: commitMessage }
	});

export const getPromptDiff = (
	token: string,
	promptId: string,
	fromId: string,
	toId: string
): Promise<PromptDiff> =>
	apiFetch(
		`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/history/diff?from_id=${fromId}&to_id=${toId}`,
		{ token }
	);
