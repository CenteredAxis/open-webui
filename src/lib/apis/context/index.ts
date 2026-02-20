import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const getUserContext = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/context`, { token });

export const updateUserContext = (token: string, context: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/context`, {
		method: 'PATCH',
		token,
		body: context
	});

export const resetUserContext = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/context`, { method: 'DELETE', token });

export const enrichContextFromGoogle = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/context/enrich/google`, {
		method: 'POST',
		token
	});
