import { fetchAPI } from '$lib/utils/api';
import { getUserPosition } from '$lib/utils';

export const getUserGroups = async (token: string) => fetchAPI('/users/groups', { token });

export const getUserDefaultPermissions = async (token: string) =>
	fetchAPI('/users/default/permissions', { token });

export const updateUserDefaultPermissions = async (token: string, permissions: object) =>
	fetchAPI('/users/default/permissions', { method: 'POST', token, body: { ...permissions } });

export const updateUserRole = async (token: string, id: string, role: string) =>
	fetchAPI('/users/update/role', { method: 'POST', token, body: { id, role } });

export const getUsers = async (
	token: string,
	query?: string,
	orderBy?: string,
	direction?: string,
	page = 1
) =>
	fetchAPI('/users/', {
		token,
		params: { page, query, order_by: orderBy, direction }
	});

export const searchUsers = async (
	token: string,
	query?: string,
	orderBy?: string,
	direction?: string,
	page = 1
) =>
	fetchAPI('/users/search', {
		token,
		params: { page, query, order_by: orderBy, direction }
	});

export const getAllUsers = async (token: string) => fetchAPI('/users/all', { token });

export const getUserSettings = async (token: string) =>
	fetchAPI('/users/user/settings', { token });

export const updateUserSettings = async (token: string, settings: object) =>
	fetchAPI('/users/user/settings/update', { method: 'POST', token, body: { ...settings } });

export const getUserInfoById = async (token: string, userId: string) =>
	fetchAPI(`/users/${userId}/info`, { token });

export const updateUserStatus = async (token: string, formData: object) =>
	fetchAPI('/users/user/status/update', { method: 'POST', token, body: { ...formData } });

export const getUserInfo = async (token: string) => fetchAPI('/users/user/info', { token });

export const updateUserInfo = async (token: string, info: object) =>
	fetchAPI('/users/user/info/update', { method: 'POST', token, body: { ...info } });

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

export const getUserActiveStatusById = async (token: string, userId: string) =>
	fetchAPI(`/users/${userId}/active`, { token });

export const deleteUserById = async (token: string, userId: string) =>
	fetchAPI(`/users/${userId}`, { method: 'DELETE', token });

type UserUpdateForm = {
	role: string;
	profile_image_url: string;
	email: string;
	name: string;
	password: string;
};

export const updateUserById = async (token: string, userId: string, user: UserUpdateForm) =>
	fetchAPI(`/users/${userId}/update`, {
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

export const getUserGroupsById = async (token: string, userId: string) =>
	fetchAPI(`/users/${userId}/groups`, { token });
