import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const createNewKnowledge = (
	token: string,
	name: string,
	description: string,
	accessGrants: object[]
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/knowledge/create`, {
		method: 'POST',
		token,
		body: { name, description, access_grants: accessGrants }
	});

export const getKnowledgeBases = (token: string = '', page: number | null = null) => {
	const searchParams = new URLSearchParams();
	if (page) searchParams.append('page', page.toString());
	return apiFetch(`${WEBUI_API_BASE_URL}/knowledge/?${searchParams.toString()}`, { token });
};

export const searchKnowledgeBases = (
	token: string = '',
	query: string | null = null,
	viewOption: string | null = null,
	page: number | null = null
) => {
	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);
	if (viewOption) searchParams.append('view_option', viewOption);
	if (page) searchParams.append('page', page.toString());
	return apiFetch(`${WEBUI_API_BASE_URL}/knowledge/search?${searchParams.toString()}`, { token });
};

export const searchKnowledgeFiles = (
	token: string,
	query?: string | null,
	viewOption?: string | null,
	orderBy?: string | null,
	direction?: string | null,
	page: number = 1
) => {
	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);
	if (viewOption) searchParams.append('view_option', viewOption);
	if (orderBy) searchParams.append('order_by', orderBy);
	if (direction) searchParams.append('direction', direction);
	searchParams.append('page', page.toString());
	return apiFetch(`${WEBUI_API_BASE_URL}/knowledge/search/files?${searchParams.toString()}`, {
		token
	});
};

export const getKnowledgeById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/knowledge/${id}`, { token });

export const searchKnowledgeFilesById = (
	token: string,
	id: string,
	query?: string | null,
	viewOption?: string | null,
	orderBy?: string | null,
	direction?: string | null,
	page: number = 1
) => {
	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);
	if (viewOption) searchParams.append('view_option', viewOption);
	if (orderBy) searchParams.append('order_by', orderBy);
	if (direction) searchParams.append('direction', direction);
	searchParams.append('page', page.toString());
	return apiFetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/files?${searchParams.toString()}`, {
		token
	});
};

type KnowledgeUpdateForm = {
	name?: string;
	description?: string;
	data?: object;
	access_grants?: object[];
};

export const updateKnowledgeById = (token: string, id: string, form: KnowledgeUpdateForm) =>
	apiFetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/update`, {
		method: 'POST',
		token,
		body: {
			name: form?.name ? form.name : undefined,
			description: form?.description ? form.description : undefined,
			data: form?.data ? form.data : undefined,
			access_grants: form.access_grants
		}
	});

export const updateKnowledgeAccessGrants = (token: string, id: string, accessGrants: any[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});

export const addFileToKnowledgeById = (token: string, id: string, fileId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/file/add`, {
		method: 'POST',
		token,
		body: { file_id: fileId }
	});

export const updateFileFromKnowledgeById = (token: string, id: string, fileId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/file/update`, {
		method: 'POST',
		token,
		body: { file_id: fileId }
	});

export const removeFileFromKnowledgeById = (token: string, id: string, fileId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/file/remove`, {
		method: 'POST',
		token,
		body: { file_id: fileId }
	});

export const resetKnowledgeById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/reset`, { method: 'POST', token });

export const deleteKnowledgeById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/delete`, { method: 'DELETE', token });

export const reindexKnowledgeFiles = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/knowledge/reindex`, { method: 'POST', token });

export const exportKnowledgeById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/export`, { token, responseType: 'blob' });
