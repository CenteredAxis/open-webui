import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const createNewTool = (token: string, tool: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/create`, { method: 'POST', token, body: { ...tool } });

export const loadToolByUrl = (token: string = '', url: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/load/url`, { method: 'POST', token, body: { url } });

export const getTools = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/`, { token });

export const getToolList = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/list`, { token });

export const exportTools = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/export`, { token });

export const getToolById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/id/${id}`, { token });

export const updateToolById = (token: string, id: string, tool: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/id/${id}/update`, {
		method: 'POST',
		token,
		body: { ...tool }
	});

export const updateToolAccessGrants = (token: string, id: string, accessGrants: any[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/id/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});

export const deleteToolById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/id/${id}/delete`, { method: 'DELETE', token });

export const getToolValvesById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves`, { token });

export const getToolValvesSpecById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves/spec`, { token });

export const updateToolValvesById = (token: string, id: string, valves: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves/update`, {
		method: 'POST',
		token,
		body: { ...valves }
	});

export const getUserValvesById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves/user`, { token });

export const getUserValvesSpecById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves/user/spec`, { token });

export const updateUserValvesById = (token: string, id: string, valves: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves/user/update`, {
		method: 'POST',
		token,
		body: { ...valves }
	});
