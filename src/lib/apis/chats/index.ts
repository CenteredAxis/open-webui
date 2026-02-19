import { WEBUI_API_BASE_URL } from '$lib/constants';
import { getTimeRange } from '$lib/utils';
import { apiFetch } from '$lib/utils/api';

export const createNewChat = (token: string, chat: object, folderId: string | null) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/new`, {
		method: 'POST',
		token,
		body: { chat: chat as Record<string, unknown>, folder_id: folderId ?? null }
	});

export const unarchiveAllChats = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/unarchive/all`, {
		method: 'POST',
		token: token || undefined
	});

export const importChats = (token: string, chats: object[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/import`, {
		method: 'POST',
		token,
		body: { chats } as Record<string, unknown>
	});

export const getChatList = async (
	token: string = '',
	page: number | null = null,
	include_pinned: boolean = false,
	include_folders: boolean = false
) => {
	const searchParams = new URLSearchParams();

	if (page !== null) {
		searchParams.append('page', `${page}`);
	}

	if (include_folders) {
		searchParams.append('include_folders', 'true');
	}

	if (include_pinned) {
		searchParams.append('include_pinned', 'true');
	}

	const res = await apiFetch<any[]>(`${WEBUI_API_BASE_URL}/chats/?${searchParams.toString()}`, {
		token: token || undefined
	});

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
	const searchParams = new URLSearchParams();

	searchParams.append('page', `${page}`);

	if (filter) {
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				searchParams.append(key, value.toString());
			}
		});
	}

	const res = await apiFetch<any[]>(
		`${WEBUI_API_BASE_URL}/chats/list/user/${userId}?${searchParams.toString()}`,
		{ token: token || undefined }
	);

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
	const searchParams = new URLSearchParams();
	searchParams.append('page', `${page}`);

	if (filter) {
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				searchParams.append(key, value.toString());
			}
		});
	}

	const res = await apiFetch<any[]>(
		`${WEBUI_API_BASE_URL}/chats/archived?${searchParams.toString()}`,
		{ token: token || undefined }
	);

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getSharedChatList = async (token: string = '', page: number = 1, filter?: object) => {
	const searchParams = new URLSearchParams();
	searchParams.append('page', `${page}`);

	if (filter) {
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				searchParams.append(key, value.toString());
			}
		});
	}

	const res = await apiFetch<any[]>(
		`${WEBUI_API_BASE_URL}/chats/shared?${searchParams.toString()}`,
		{ token: token || undefined }
	);

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getAllChats = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/all`, { token: token || undefined });

export const getChatListBySearchText = async (token: string, text: string, page: number = 1) => {
	const searchParams = new URLSearchParams();
	searchParams.append('text', text);
	searchParams.append('page', `${page}`);

	const res = await apiFetch<any[]>(
		`${WEBUI_API_BASE_URL}/chats/search?${searchParams.toString()}`,
		{ token: token || undefined }
	);

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getChatsByFolderId = (token: string, folderId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/folder/${folderId}`, { token: token || undefined });

export const getChatListByFolderId = (token: string, folderId: string, page: number = 1) => {
	const searchParams = new URLSearchParams();
	if (page !== null) {
		searchParams.append('page', `${page}`);
	}

	return apiFetch(
		`${WEBUI_API_BASE_URL}/chats/folder/${folderId}/list?${searchParams.toString()}`,
		{ token: token || undefined }
	);
};

export const getAllArchivedChats = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/all/archived`, { token: token || undefined });

export const getAllUserChats = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/all/db`, { token: token || undefined });

export const getAllTags = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/all/tags`, { token: token || undefined });

export const getPinnedChatList = async (token: string = '') => {
	const res = await apiFetch<any[]>(`${WEBUI_API_BASE_URL}/chats/pinned`, {
		token: token || undefined
	});

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getChatListByTagName = async (token: string = '', tagName: string) => {
	const res = await apiFetch<any[]>(`${WEBUI_API_BASE_URL}/chats/tags`, {
		method: 'POST',
		token: token || undefined,
		body: { name: tagName }
	});

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getChatById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}`, { token: token || undefined });

export const getChatByShareId = (token: string, share_id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/share/${share_id}`, { token: token || undefined });

export const getChatPinnedStatusById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/pinned`, { token: token || undefined });

export const toggleChatPinnedStatusById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/pin`, {
		method: 'POST',
		token: token || undefined
	});

export const cloneChatById = (token: string, id: string, title?: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/clone`, {
		method: 'POST',
		token: token || undefined,
		body: { ...(title && { title }) }
	});

export const cloneSharedChatById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/clone/shared`, {
		method: 'POST',
		token: token || undefined
	});

export const shareChatById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/share`, {
		method: 'POST',
		token: token || undefined
	});

export const updateChatFolderIdById = (token: string, id: string, folderId?: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/folder`, {
		method: 'POST',
		token: token || undefined,
		body: { folder_id: folderId }
	});

export const archiveChatById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/archive`, {
		method: 'POST',
		token: token || undefined
	});

export const deleteSharedChatById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/share`, {
		method: 'DELETE',
		token: token || undefined
	});

export const updateChatById = (token: string, id: string, chat: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}`, {
		method: 'POST',
		token: token || undefined,
		body: { chat: chat as Record<string, unknown> }
	});

export const deleteChatById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}`, {
		method: 'DELETE',
		token: token || undefined
	});

export const getTagsById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/tags`, { token: token || undefined });

export const addTagById = (token: string, id: string, tagName: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/tags`, {
		method: 'POST',
		token: token || undefined,
		body: { name: tagName }
	});

export const deleteTagById = (token: string, id: string, tagName: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/tags`, {
		method: 'DELETE',
		token: token || undefined,
		body: { name: tagName }
	});

export const deleteTagsById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/${id}/tags/all`, {
		method: 'DELETE',
		token: token || undefined
	});

export const deleteAllChats = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/`, {
		method: 'DELETE',
		token: token || undefined
	});

export const archiveAllChats = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/archive/all`, {
		method: 'POST',
		token: token || undefined
	});

export const exportChatStats = (token: string, page: number = 1, params: object = {}) => {
	const searchParams = new URLSearchParams();
	searchParams.append('page', `${page}`);

	if (params) {
		for (const [key, value] of Object.entries(params)) {
			searchParams.append(key, `${value}`);
		}
	}

	return apiFetch(`${WEBUI_API_BASE_URL}/chats/stats/export?${searchParams.toString()}`, {
		token: token || undefined
	});
};

export const exportSingleChatStats = (token: string, chatId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/chats/stats/export/${chatId}`, {
		token: token || undefined
	});

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
