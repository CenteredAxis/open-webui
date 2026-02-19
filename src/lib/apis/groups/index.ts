import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const createNewGroup = (token: string, group: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/groups/create`, { method: 'POST', token, body: { ...group } });

export const getGroups = async (token: string = '', share?: boolean) => {
	const searchParams = new URLSearchParams();
	if (share !== undefined) {
		searchParams.append('share', String(share));
	}

	return apiFetch(`${WEBUI_API_BASE_URL}/groups/?${searchParams.toString()}`, { token });
};

export const getGroupById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/groups/id/${id}`, { token });

export const getGroupInfoById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/groups/id/${id}/info`, { token });

export const updateGroupById = (token: string, id: string, group: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/groups/id/${id}/update`, {
		method: 'POST',
		token,
		body: { ...group }
	});

export const deleteGroupById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/groups/id/${id}/delete`, { method: 'DELETE', token });

export const addUserToGroup = (token: string, id: string, userIds: string[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/groups/id/${id}/users/add`, {
		method: 'POST',
		token,
		body: { user_ids: userIds }
	});

export const removeUserFromGroup = (token: string, id: string, userIds: string[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/groups/id/${id}/users/remove`, {
		method: 'POST',
		token,
		body: { user_ids: userIds }
	});
