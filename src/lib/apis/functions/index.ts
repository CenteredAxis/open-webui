import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const createNewFunction = (token: string, func: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/create`, {
		method: 'POST',
		token,
		body: { ...func }
	});

export const getFunctions = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/`, { token });

export const getFunctionList = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/list`, { token });

export const loadFunctionByUrl = (token: string = '', url: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/load/url`, { method: 'POST', token, body: { url } });

export const exportFunctions = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/export`, { token });

export const getFunctionById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/id/${id}`, { token });

export const updateFunctionById = (token: string, id: string, func: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/update`, {
		method: 'POST',
		token,
		body: { ...func }
	});

export const deleteFunctionById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/delete`, { method: 'DELETE', token });

export const toggleFunctionById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/toggle`, { method: 'POST', token });

export const toggleGlobalById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/toggle/global`, { method: 'POST', token });

export const getFunctionValvesById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves`, { token });

export const getFunctionValvesSpecById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/spec`, { token });

export const updateFunctionValvesById = (token: string, id: string, valves: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/update`, {
		method: 'POST',
		token,
		body: { ...valves }
	});

export const getUserValvesById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/user`, { token });

export const getUserValvesSpecById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/user/spec`, { token });

export const updateUserValvesById = (token: string, id: string, valves: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/user/update`, {
		method: 'POST',
		token,
		body: { ...valves }
	});
