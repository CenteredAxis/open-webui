import { fetchAPI } from '$lib/utils/api';

export const getModelItems = async (
	token: string = '',
	query,
	viewOption,
	selectedTag,
	orderBy,
	direction,
	page
) =>
	fetchAPI('/models/list', {
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

export const getModelTags = async (token: string = '') => fetchAPI('/models/tags', { token });

export const importModels = async (token: string, models: object[]) =>
	fetchAPI('/models/import', { method: 'POST', token, body: { models } });

export const getBaseModels = async (token: string = '') => fetchAPI('/models/base', { token });

export const createNewModel = async (token: string, model: object) =>
	fetchAPI('/models/create', { method: 'POST', token, body: model });

export const getModelById = async (token: string, id: string) =>
	fetchAPI('/models/model', { token, params: { id } });

export const toggleModelById = async (token: string, id: string) =>
	fetchAPI('/models/model/toggle', { method: 'POST', token, params: { id } });

export const updateModelById = async (token: string, id: string, model: object) =>
	fetchAPI('/models/model/update', { method: 'POST', token, body: { ...model, id } });

export const updateModelAccessGrants = async (token: string, id: string, accessGrants: any[]) =>
	fetchAPI('/models/model/access/update', {
		method: 'POST',
		token,
		body: { id, access_grants: accessGrants }
	});

export const deleteModelById = async (token: string, id: string) =>
	fetchAPI('/models/model/delete', { method: 'POST', token, body: { id } });

export const deleteAllModels = async (token: string) =>
	fetchAPI('/models/delete/all', { method: 'DELETE', token });
