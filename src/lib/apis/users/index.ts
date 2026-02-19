import { WEBUI_API_BASE_URL } from '$lib/constants';
import { getUserPosition } from '$lib/utils';
import { apiFetch } from '$lib/utils/api';

export const getUserGroups = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/groups`, { token });

export const getUserDefaultPermissions = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/default/permissions`, { token });

export const updateUserDefaultPermissions = (token: string, permissions: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/default/permissions`, {
		method: 'POST',
		token,
		body: { ...permissions }
	});

export const updateUserRole = (token: string, id: string, role: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/update/role`, {
		method: 'POST',
		token,
		body: { id, role }
	});

export const getUsers = (
	token: string,
	query?: string,
	orderBy?: string,
	direction?: string,
	page = 1
) => {
	const searchParams = new URLSearchParams();

	searchParams.set('page', `${page}`);

	if (query) {
		searchParams.set('query', query);
	}

	if (orderBy) {
		searchParams.set('order_by', orderBy);
	}

	if (direction) {
		searchParams.set('direction', direction);
	}

	return apiFetch(`${WEBUI_API_BASE_URL}/users/?${searchParams.toString()}`, { token });
};

export const searchUsers = (
	token: string,
	query?: string,
	orderBy?: string,
	direction?: string,
	page = 1
) => {
	const searchParams = new URLSearchParams();

	searchParams.set('page', `${page}`);

	if (query) {
		searchParams.set('query', query);
	}

	if (orderBy) {
		searchParams.set('order_by', orderBy);
	}

	if (direction) {
		searchParams.set('direction', direction);
	}

	return apiFetch(`${WEBUI_API_BASE_URL}/users/search?${searchParams.toString()}`, { token });
};

export const getAllUsers = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/all`, { token });

export const getUserSettings = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/user/settings`, { token });

export const updateUserSettings = (token: string, settings: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/user/settings/update`, {
		method: 'POST',
		token,
		body: { ...settings }
	});

export const getUserInfoById = (token: string, userId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/${userId}/info`, { token });

export const updateUserStatus = (token: string, formData: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/user/status/update`, {
		method: 'POST',
		token,
		body: { ...formData }
	});

export const getUserInfo = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/user/info`, { token });

export const updateUserInfo = (token: string, info: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/user/info/update`, {
		method: 'POST',
		token,
		body: { ...info }
	});

export const getAndUpdateUserLocation = async (token: string) => {
	const location = await getUserPosition().catch((err) => {
		console.error(err);
		return null;
	});

	if (location) {
		await updateUserInfo(token, { location: location });
		return location;
	} else {
		console.info('Failed to get user location');
		return null;
	}
};

export const getUserActiveStatusById = (token: string, userId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/${userId}/active`, { token });

export const deleteUserById = (token: string, userId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/${userId}`, { method: 'DELETE', token });

type UserUpdateForm = {
	role: string;
	profile_image_url: string;
	email: string;
	name: string;
	password: string;
};

export const updateUserById = (token: string, userId: string, user: UserUpdateForm) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/${userId}/update`, {
		method: 'POST',
		token,
		body: {
			profile_image_url: user.profile_image_url,
			role: user.role,
			email: user.email,
			name: user.name,
			password: user.password !== '' ? user.password : undefined
		}
	});

export const getUserGroupsById = (token: string, userId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/users/${userId}/groups`, { token });
