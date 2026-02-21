import { fetchAPI } from '$lib/utils/api';

export const createNewTool = async (token: string, tool: object) =>
	fetchAPI('/tools/create', { method: 'POST', token, body: { ...tool } });

export const loadToolByUrl = async (token: string = '', url: string) =>
	fetchAPI('/tools/load/url', { method: 'POST', token, body: { url } });

export const getTools = async (token: string = '') => fetchAPI('/tools/', { token });

export const getToolList = async (token: string = '') => fetchAPI('/tools/list', { token });

export const exportTools = async (token: string = '') => fetchAPI('/tools/export', { token });

export const getToolById = async (token: string, id: string) =>
	fetchAPI(`/tools/id/${id}`, { token });

export const updateToolById = async (token: string, id: string, tool: object) =>
	fetchAPI(`/tools/id/${id}/update`, { method: 'POST', token, body: { ...tool } });

export const updateToolAccessGrants = async (token: string, id: string, accessGrants: any[]) =>
	fetchAPI(`/tools/id/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});

export const deleteToolById = async (token: string, id: string) =>
	fetchAPI(`/tools/id/${id}/delete`, { method: 'DELETE', token });

export const getToolValvesById = async (token: string, id: string) =>
	fetchAPI(`/tools/id/${id}/valves`, { token });

export const getToolValvesSpecById = async (token: string, id: string) =>
	fetchAPI(`/tools/id/${id}/valves/spec`, { token });

export const updateToolValvesById = async (token: string, id: string, valves: object) =>
	fetchAPI(`/tools/id/${id}/valves/update`, { method: 'POST', token, body: { ...valves } });

export const getUserValvesById = async (token: string, id: string) =>
	fetchAPI(`/tools/id/${id}/valves/user`, { token });

export const getUserValvesSpecById = async (token: string, id: string) =>
	fetchAPI(`/tools/id/${id}/valves/user/spec`, { token });

export const updateUserValvesById = async (token: string, id: string, valves: object) =>
	fetchAPI(`/tools/id/${id}/valves/user/update`, { method: 'POST', token, body: { ...valves } });
