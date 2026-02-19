import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

type FolderForm = {
	name?: string;
	data?: Record<string, any>;
	meta?: Record<string, any>;
};

export const createNewFolder = (token: string, folderForm: FolderForm) =>
	apiFetch(`${WEBUI_API_BASE_URL}/folders/`, { method: 'POST', token, body: folderForm });

export const getFolders = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/folders/`, { token });

export const getFolderById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/folders/${id}`, { token });

export const updateFolderById = (token: string, id: string, folderForm: FolderForm) =>
	apiFetch(`${WEBUI_API_BASE_URL}/folders/${id}/update`, {
		method: 'POST',
		token,
		body: folderForm
	});

export const updateFolderIsExpandedById = (token: string, id: string, isExpanded: boolean) =>
	apiFetch(`${WEBUI_API_BASE_URL}/folders/${id}/update/expanded`, {
		method: 'POST',
		token,
		body: { is_expanded: isExpanded }
	});

export const updateFolderParentIdById = (token: string, id: string, parentId?: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/folders/${id}/update/parent`, {
		method: 'POST',
		token,
		body: { parent_id: parentId }
	});

type FolderItems = {
	chat_ids: string[];
	file_ids: string[];
};

export const updateFolderItemsById = (token: string, id: string, items: FolderItems) =>
	apiFetch(`${WEBUI_API_BASE_URL}/folders/${id}/update/items`, {
		method: 'POST',
		token,
		body: { items: items }
	});

export const deleteFolderById = async (token: string, id: string, deleteContents: boolean) => {
	const searchParams = new URLSearchParams();
	searchParams.append('delete_contents', deleteContents ? 'true' : 'false');

	return apiFetch(`${WEBUI_API_BASE_URL}/folders/${id}?${searchParams.toString()}`, {
		method: 'DELETE',
		token
	});
};
