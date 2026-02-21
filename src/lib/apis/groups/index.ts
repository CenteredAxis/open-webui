import { fetchAPI } from '$lib/utils/api';

export const createNewGroup = async (token: string, group: object) =>
	fetchAPI('/groups/create', { method: 'POST', token, body: { ...group } });

export const getGroups = async (token: string = '', share?: boolean) =>
	fetchAPI('/groups/', {
		token,
		params: share !== undefined ? { share: String(share) } : {}
	});

export const getGroupById = async (token: string, id: string) =>
	fetchAPI(`/groups/id/${id}`, { token });

export const getGroupInfoById = async (token: string, id: string) =>
	fetchAPI(`/groups/id/${id}/info`, { token });

export const updateGroupById = async (token: string, id: string, group: object) =>
	fetchAPI(`/groups/id/${id}/update`, { method: 'POST', token, body: { ...group } });

export const deleteGroupById = async (token: string, id: string) =>
	fetchAPI(`/groups/id/${id}/delete`, { method: 'DELETE', token });

export const addUserToGroup = async (token: string, id: string, userIds: string[]) =>
	fetchAPI(`/groups/id/${id}/users/add`, { method: 'POST', token, body: { user_ids: userIds } });

export const removeUserFromGroup = async (token: string, id: string, userIds: string[]) =>
	fetchAPI(`/groups/id/${id}/users/remove`, {
		method: 'POST',
		token,
		body: { user_ids: userIds }
	});
