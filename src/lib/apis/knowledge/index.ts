import { WEBUI_API_BASE_URL } from '$lib/constants';
import { fetchAPI } from '$lib/utils/api';

export const createNewKnowledge = async (
	token: string,
	name: string,
	description: string,
	accessGrants: object[]
) =>
	fetchAPI('/knowledge/create', {
		method: 'POST',
		token,
		body: { name, description, access_grants: accessGrants }
	});

export const getKnowledgeBases = async (token: string = '', page: number | null = null) =>
	fetchAPI('/knowledge/', { token, params: { page } });

export const searchKnowledgeBases = async (
	token: string = '',
	query: string | null = null,
	viewOption: string | null = null,
	page: number | null = null
) => fetchAPI('/knowledge/search', { token, params: { query, view_option: viewOption, page } });

export const searchKnowledgeFiles = async (
	token: string,
	query?: string | null,
	viewOption?: string | null,
	orderBy?: string | null,
	direction?: string | null,
	page: number = 1
) =>
	fetchAPI('/knowledge/search/files', {
		token,
		params: { query, view_option: viewOption, order_by: orderBy, direction, page }
	});

export const getKnowledgeById = async (token: string, id: string) =>
	fetchAPI(`/knowledge/${id}`, { token });

export const searchKnowledgeFilesById = async (
	token: string,
	id: string,
	query?: string | null,
	viewOption?: string | null,
	orderBy?: string | null,
	direction?: string | null,
	page: number = 1
) =>
	fetchAPI(`/knowledge/${id}/files`, {
		token,
		params: { query, view_option: viewOption, order_by: orderBy, direction, page }
	});

type KnowledgeUpdateForm = {
	name?: string;
	description?: string;
	data?: object;
	access_grants?: object[];
};

export const updateKnowledgeById = async (token: string, id: string, form: KnowledgeUpdateForm) =>
	fetchAPI(`/knowledge/${id}/update`, {
		method: 'POST',
		token,
		body: {
			name: form?.name ? form.name : undefined,
			description: form?.description ? form.description : undefined,
			data: form?.data ? form.data : undefined,
			access_grants: form.access_grants
		}
	});

export const updateKnowledgeAccessGrants = async (
	token: string,
	id: string,
	accessGrants: any[]
) =>
	fetchAPI(`/knowledge/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});

export const addFileToKnowledgeById = async (token: string, id: string, fileId: string) =>
	fetchAPI(`/knowledge/${id}/file/add`, { method: 'POST', token, body: { file_id: fileId } });

export const updateFileFromKnowledgeById = async (token: string, id: string, fileId: string) =>
	fetchAPI(`/knowledge/${id}/file/update`, { method: 'POST', token, body: { file_id: fileId } });

export const removeFileFromKnowledgeById = async (token: string, id: string, fileId: string) =>
	fetchAPI(`/knowledge/${id}/file/remove`, { method: 'POST', token, body: { file_id: fileId } });

export const resetKnowledgeById = async (token: string, id: string) =>
	fetchAPI(`/knowledge/${id}/reset`, { method: 'POST', token });

export const deleteKnowledgeById = async (token: string, id: string) =>
	fetchAPI(`/knowledge/${id}/delete`, { method: 'DELETE', token });

export const reindexKnowledgeFiles = async (token: string) =>
	fetchAPI('/knowledge/reindex', { method: 'POST', token });

// exportKnowledgeById returns a Blob (file download) — keep as raw fetch
export const exportKnowledgeById = async (token: string, id: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/export`, {
		method: 'GET',
		headers: {
			authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.blob();
		})
		.catch((err) => {
			error = err.detail;
			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};
