import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const getModelItems = (
	token: string = '',
	query,
	viewOption,
	selectedTag,
	orderBy,
	direction,
	page
) => {
	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);
	if (viewOption) searchParams.append('view_option', viewOption);
	if (selectedTag) searchParams.append('tag', selectedTag);
	if (orderBy) searchParams.append('order_by', orderBy);
	if (direction) searchParams.append('direction', direction);
	if (page) searchParams.append('page', page.toString());

	return apiFetch(`${WEBUI_API_BASE_URL}/models/list?${searchParams.toString()}`, { token });
};

export const getModelTags = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/models/tags`, { token });

export const importModels = (token: string, models: object[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/models/import`, {
		method: 'POST',
		token,
		body: { models }
	});

export const getBaseModels = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/models/base`, { token });

export const createNewModel = (token: string, model: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/models/create`, { method: 'POST', token, body: model as Record<string, unknown> });

export const getModelById = (token: string, id: string) => {
	const searchParams = new URLSearchParams();
	searchParams.append('id', id);

	return apiFetch(`${WEBUI_API_BASE_URL}/models/model?${searchParams.toString()}`, { token });
};

export const toggleModelById = (token: string, id: string) => {
	const searchParams = new URLSearchParams();
	searchParams.append('id', id);

	return apiFetch(`${WEBUI_API_BASE_URL}/models/model/toggle?${searchParams.toString()}`, {
		method: 'POST',
		token
	});
};

export const updateModelById = (token: string, id: string, model: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/models/model/update`, {
		method: 'POST',
		token,
		body: { ...model, id }
	});

export const updateModelAccessGrants = (token: string, id: string, accessGrants: any[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/models/model/access/update`, {
		method: 'POST',
		token,
		body: { id, access_grants: accessGrants }
	});

export const deleteModelById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/models/model/delete`, {
		method: 'POST',
		token,
		body: { id }
	});

export const deleteAllModels = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/models/delete/all`, { method: 'DELETE', token });
