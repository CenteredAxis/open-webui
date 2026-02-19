import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';
import { getTimeRange } from '$lib/utils';

type NoteItem = {
	title: string;
	data: object;
	meta?: null | object;
	access_grants?: object[];
};

export const createNewNote = (token: string, note: NoteItem) =>
	apiFetch(`${WEBUI_API_BASE_URL}/notes/create`, { method: 'POST', token, body: { ...note } });

export const getNotes = async (token: string = '', raw: boolean = false) => {
	const res = await apiFetch<any[]>(`${WEBUI_API_BASE_URL}/notes/`, { token });

	if (raw) {
		return res; // Return raw response if requested
	}

	if (!Array.isArray(res)) {
		return {}; // or throw new Error("Notes response is not an array")
	}

	// Build the grouped object
	const grouped: Record<string, any[]> = {};
	for (const note of res) {
		const timeRange = getTimeRange(note.updated_at / 1000000000);
		if (!grouped[timeRange]) {
			grouped[timeRange] = [];
		}
		grouped[timeRange].push({
			...note,
			timeRange
		});
	}

	return grouped;
};

export const searchNotes = async (
	token: string = '',
	query: string | null = null,
	viewOption: string | null = null,
	permission: string | null = null,
	sortKey: string | null = null,
	page: number | null = null
) => {
	const searchParams = new URLSearchParams();

	if (query !== null) {
		searchParams.append('query', query);
	}

	if (viewOption !== null) {
		searchParams.append('view_option', viewOption);
	}

	if (permission !== null) {
		searchParams.append('permission', permission);
	}

	if (sortKey !== null) {
		searchParams.append('order_by', sortKey);
	}

	if (page !== null) {
		searchParams.append('page', `${page}`);
	}

	return apiFetch(`${WEBUI_API_BASE_URL}/notes/search?${searchParams.toString()}`, { token });
};

export const getNoteList = async (token: string = '', page: number | null = null) => {
	const searchParams = new URLSearchParams();

	if (page !== null) {
		searchParams.append('page', `${page}`);
	}

	return apiFetch(`${WEBUI_API_BASE_URL}/notes/?${searchParams.toString()}`, { token });
};

export const getNoteById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/notes/${id}`, { token });

export const updateNoteById = (token: string, id: string, note: NoteItem) =>
	apiFetch(`${WEBUI_API_BASE_URL}/notes/${id}/update`, {
		method: 'POST',
		token,
		body: { ...note }
	});

export const updateNoteAccessGrants = (token: string, id: string, accessGrants: any[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/notes/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});

export const deleteNoteById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/notes/${id}/delete`, { method: 'DELETE', token });
