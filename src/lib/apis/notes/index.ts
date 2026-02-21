import { getTimeRange } from '$lib/utils';
import { fetchAPI } from '$lib/utils/api';

type NoteItem = {
	title: string;
	data: object;
	meta?: null | object;
	access_grants?: object[];
};

export const createNewNote = async (token: string, note: NoteItem) =>
	fetchAPI('/notes/create', { method: 'POST', token, body: { ...note } });

export const getNotes = async (token: string = '', raw: boolean = false) => {
	const res = await fetchAPI<any>('/notes/', { token });

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
) =>
	fetchAPI('/notes/search', {
		token,
		params: { query, view_option: viewOption, permission, order_by: sortKey, page }
	});

export const getNoteList = async (token: string = '', page: number | null = null) =>
	fetchAPI('/notes/', { token, params: { page } });

export const getNoteById = async (token: string, id: string) =>
	fetchAPI(`/notes/${id}`, { token });

export const updateNoteById = async (token: string, id: string, note: NoteItem) =>
	fetchAPI(`/notes/${id}/update`, { method: 'POST', token, body: { ...note } });

export const updateNoteAccessGrants = async (token: string, id: string, accessGrants: any[]) =>
	fetchAPI(`/notes/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});

export const deleteNoteById = async (token: string, id: string) =>
	fetchAPI(`/notes/${id}/delete`, { method: 'DELETE', token });
