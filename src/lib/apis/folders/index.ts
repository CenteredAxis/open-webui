import { fetchAPI } from '$lib/utils/api';

type FolderForm = {
	name?: string;
	data?: Record<string, any>;
	meta?: Record<string, any>;
};

export const createNewFolder = async (token: string, folderForm: FolderForm) =>
	fetchAPI('/folders/', { method: 'POST', token, body: folderForm });

export const getFolders = async (token: string = '') => fetchAPI('/folders/', { token });

export const getFolderById = async (token: string, id: string) =>
	fetchAPI(`/folders/${id}`, { token });

export const updateFolderById = async (token: string, id: string, folderForm: FolderForm) =>
	fetchAPI(`/folders/${id}/update`, { method: 'POST', token, body: folderForm });

export const updateFolderIsExpandedById = async (
	token: string,
	id: string,
	isExpanded: boolean
) =>
	fetchAPI(`/folders/${id}/update/expanded`, {
		method: 'POST',
		token,
		body: { is_expanded: isExpanded }
	});

export const updateFolderParentIdById = async (token: string, id: string, parentId?: string) =>
	fetchAPI(`/folders/${id}/update/parent`, {
		method: 'POST',
		token,
		body: { parent_id: parentId }
	});

type FolderItems = {
	chat_ids: string[];
	file_ids: string[];
};

export const updateFolderItemsById = async (token: string, id: string, items: FolderItems) =>
	fetchAPI(`/folders/${id}/update/items`, { method: 'POST', token, body: { items } });

export const deleteFolderById = async (token: string, id: string, deleteContents: boolean) =>
	fetchAPI(`/folders/${id}`, {
		method: 'DELETE',
		token,
		params: { delete_contents: deleteContents ? 'true' : 'false' }
	});
