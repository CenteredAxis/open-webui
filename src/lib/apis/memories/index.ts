import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const getMemories = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/memories/`, { token });

export const addNewMemory = (token: string, content: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/memories/add`, { method: 'POST', token, body: { content } });

export const updateMemoryById = (token: string, id: string, content: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/memories/${id}/update`, {
		method: 'POST',
		token,
		body: { content }
	});

export const queryMemory = (token: string, content: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/memories/query`, { method: 'POST', token, body: { content } });

export const deleteMemoryById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/memories/${id}`, { method: 'DELETE', token });

export const deleteMemoriesByUserId = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/memories/delete/user`, { method: 'DELETE', token });
