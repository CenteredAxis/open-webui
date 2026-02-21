import { fetchAPI } from '$lib/utils/api';

export const getMemories = async (token: string) => fetchAPI('/memories/', { token });

export const addNewMemory = async (token: string, content: string) =>
	fetchAPI('/memories/add', { method: 'POST', token, body: { content } });

export const updateMemoryById = async (token: string, id: string, content: string) =>
	fetchAPI(`/memories/${id}/update`, { method: 'POST', token, body: { content } });

export const queryMemory = async (token: string, content: string) =>
	fetchAPI('/memories/query', { method: 'POST', token, body: { content } });

export const deleteMemoryById = async (token: string, id: string) =>
	fetchAPI(`/memories/${id}`, { method: 'DELETE', token });

export const deleteMemoriesByUserId = async (token: string) =>
	fetchAPI('/memories/delete/user', { method: 'DELETE', token });
