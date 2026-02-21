import { WEBUI_API_BASE_URL } from '$lib/constants';
import { getTimeRange } from '$lib/utils';
import { fetchAPI } from '$lib/utils/api';

export const createNewChat = async (token: string, chat: object, folderId: string | null) =>
	fetchAPI('/chats/new', {
		method: 'POST',
		token,
		body: { chat, folder_id: folderId ?? null }
	});

export const unarchiveAllChats = async (token: string) =>
	fetchAPI('/chats/unarchive/all', { method: 'POST', token });

export const importChats = async (token: string, chats: object[]) =>
	fetchAPI('/chats/import', { method: 'POST', token, body: { chats } });

export const getChatList = async (
	token: string = '',
	page: number | null = null,
	include_pinned: boolean = false,
	include_folders: boolean = false
) => {
	const params: Record<string, string | number | null | undefined> = {};
	if (page !== null) params.page = page;
	if (include_folders) params.include_folders = 'true';
	if (include_pinned) params.include_pinned = 'true';

	const res = await fetchAPI<any[]>('/chats/', { token, params });

	if (!res) {
		return [];
	}

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getChatListByUserId = async (
	token: string = '',
	userId: string,
	page: number = 1,
	filter?: object
) => {
	const params: Record<string, string | number | null | undefined> = { page };
	if (filter) {
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				params[key] = value.toString();
			}
		});
	}

	const res = await fetchAPI<any[]>(`/chats/list/user/${userId}`, { token, params });

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getArchivedChatList = async (
	token: string = '',
	page: number = 1,
	filter?: object
) => {
	const params: Record<string, string | number | null | undefined> = { page };
	if (filter) {
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				params[key] = value.toString();
			}
		});
	}

	const res = await fetchAPI<any[]>('/chats/archived', { token, params });

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getSharedChatList = async (token: string = '', page: number = 1, filter?: object) => {
	const params: Record<string, string | number | null | undefined> = { page };
	if (filter) {
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				params[key] = value.toString();
			}
		});
	}

	const res = await fetchAPI<any[]>('/chats/shared', { token, params });

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getAllChats = async (token: string) => fetchAPI('/chats/all', { token });

export const getChatListBySearchText = async (token: string, text: string, page: number = 1) => {
	const res = await fetchAPI<any[]>('/chats/search', { token, params: { text, page } });

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getChatsByFolderId = async (token: string, folderId: string) =>
	fetchAPI(`/chats/folder/${folderId}`, { token });

export const getChatListByFolderId = async (token: string, folderId: string, page: number = 1) =>
	fetchAPI(`/chats/folder/${folderId}/list`, { token, params: { page } });

export const getAllArchivedChats = async (token: string) =>
	fetchAPI('/chats/all/archived', { token });

export const getAllUserChats = async (token: string) => fetchAPI('/chats/all/db', { token });

export const getAllTags = async (token: string) => fetchAPI('/chats/all/tags', { token });

export const getPinnedChatList = async (token: string = '') => {
	const res = await fetchAPI<any[]>('/chats/pinned', { token });

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getChatListByTagName = async (token: string = '', tagName: string) => {
	const res = await fetchAPI<any[]>('/chats/tags', {
		method: 'POST',
		token,
		body: { name: tagName }
	});

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getChatById = async (token: string, id: string) =>
	fetchAPI(`/chats/${id}`, { token });

export const getChatByShareId = async (token: string, share_id: string) =>
	fetchAPI(`/chats/share/${share_id}`, { token });

export const getChatPinnedStatusById = async (token: string, id: string) =>
	fetchAPI(`/chats/${id}/pinned`, { token });

export const toggleChatPinnedStatusById = async (token: string, id: string) =>
	fetchAPI(`/chats/${id}/pin`, { method: 'POST', token });

export const cloneChatById = async (token: string, id: string, title?: string) =>
	fetchAPI(`/chats/${id}/clone`, {
		method: 'POST',
		token,
		body: { ...(title && { title }) }
	});

export const cloneSharedChatById = async (token: string, id: string) =>
	fetchAPI(`/chats/${id}/clone/shared`, { method: 'POST', token });

export const shareChatById = async (token: string, id: string) =>
	fetchAPI(`/chats/${id}/share`, { method: 'POST', token });

export const updateChatFolderIdById = async (token: string, id: string, folderId?: string) =>
	fetchAPI(`/chats/${id}/folder`, { method: 'POST', token, body: { folder_id: folderId } });

export const archiveChatById = async (token: string, id: string) =>
	fetchAPI(`/chats/${id}/archive`, { method: 'POST', token });

export const deleteSharedChatById = async (token: string, id: string) =>
	fetchAPI(`/chats/${id}/share`, { method: 'DELETE', token });

export const updateChatById = async (token: string, id: string, chat: object) =>
	fetchAPI(`/chats/${id}`, { method: 'POST', token, body: { chat } });

export const deleteChatById = async (token: string, id: string) =>
	fetchAPI(`/chats/${id}`, { method: 'DELETE', token });

export const getTagsById = async (token: string, id: string) =>
	fetchAPI(`/chats/${id}/tags`, { token });

export const addTagById = async (token: string, id: string, tagName: string) =>
	fetchAPI(`/chats/${id}/tags`, { method: 'POST', token, body: { name: tagName } });

export const deleteTagById = async (token: string, id: string, tagName: string) =>
	fetchAPI(`/chats/${id}/tags`, { method: 'DELETE', token, body: { name: tagName } });

export const deleteTagsById = async (token: string, id: string) =>
	fetchAPI(`/chats/${id}/tags/all`, { method: 'DELETE', token });

export const deleteAllChats = async (token: string) =>
	fetchAPI('/chats/', { method: 'DELETE', token });

export const archiveAllChats = async (token: string) =>
	fetchAPI('/chats/archive/all', { method: 'POST', token });

export const exportChatStats = async (token: string, page: number = 1, params: object = {}) => {
	const searchParams: Record<string, string | number | null | undefined> = { page };
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			searchParams[key] = value;
		}
	}
	return fetchAPI('/chats/stats/export', { token, params: searchParams });
};

export const exportSingleChatStats = async (token: string, chatId: string) =>
	fetchAPI(`/chats/stats/export/${chatId}`, { token });

// downloadChatStats returns a streaming Response with AbortController — keep as raw fetch
export const downloadChatStats = async (
	token: string = '',
	updated_at: number | null = null
): Promise<[Response | null, AbortController]> => {
	const controller = new AbortController();
	let error = null;

	let url = `${WEBUI_API_BASE_URL}/chats/stats/export?stream=true`;
	if (updated_at) url += `&updated_at=${updated_at}`;

	const res = await fetch(url, {
		signal: controller.signal,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	}).catch((err) => {
		console.error(err);
		error = err;
		return null;
	});

	if (error) {
		throw error;
	}

	return [res, controller];
};
