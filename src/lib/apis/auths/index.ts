import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const getAdminDetails = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/admin/details`, { token });

export const getAdminConfig = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/admin/config`, { token });

export const updateAdminConfig = (token: string, body: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/admin/config`, {
		method: 'POST',
		token,
		body: body as Record<string, unknown>
	});

export const getSessionUser = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/`, { token });

export const ldapUserSignIn = (user: string, password: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/ldap`, {
		method: 'POST',
		body: { user, password }
	});

export const getLdapConfig = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/admin/config/ldap`, { token: token || undefined });

export const updateLdapConfig = (token: string = '', enable_ldap: boolean) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/admin/config/ldap`, {
		method: 'POST',
		token: token || undefined,
		body: { enable_ldap }
	});

export const getLdapServer = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/admin/config/ldap/server`, { token: token || undefined });

export const updateLdapServer = (token: string = '', body: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/admin/config/ldap/server`, {
		method: 'POST',
		token: token || undefined,
		body: body as Record<string, unknown>
	});

export const userSignIn = (email: string, password: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/signin`, {
		method: 'POST',
		body: { email, password }
	});

export const userSignUp = (
	name: string,
	email: string,
	password: string,
	profile_image_url: string
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/signup`, {
		method: 'POST',
		body: { name, email, password, profile_image_url }
	});

export const userSignOut = async () => {
	const res = await apiFetch(`${WEBUI_API_BASE_URL}/auths/signout`);
	sessionStorage.clear();
	return res;
};

export const addUser = (
	token: string,
	name: string,
	email: string,
	password: string,
	role: string = 'pending',
	profile_image_url: null | string = null
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/add`, {
		method: 'POST',
		token: token || undefined,
		body: {
			name,
			email,
			password,
			role,
			...(profile_image_url && { profile_image_url })
		}
	});

export const updateUserProfile = (token: string, profile: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/update/profile`, {
		method: 'POST',
		token: token || undefined,
		body: { ...(profile as Record<string, unknown>) }
	});

export const updateUserTimezone = async (token: string, timezone: string) => {
	await apiFetch(`${WEBUI_API_BASE_URL}/auths/update/timezone`, {
		method: 'POST',
		token: token || undefined,
		body: { timezone }
	}).catch((err) => {
		console.error('Failed to update timezone:', err);
	});
};

export const updateUserPassword = (token: string, password: string, newPassword: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/update/password`, {
		method: 'POST',
		token: token || undefined,
		body: { password, new_password: newPassword }
	});

export const getSignUpEnabledStatus = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/signup/enabled`, { token });

export const getDefaultUserRole = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/signup/user/role`, { token });

export const updateDefaultUserRole = (token: string, role: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/signup/user/role`, {
		method: 'POST',
		token,
		body: { role }
	});

export const toggleSignUpEnabledStatus = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/signup/enabled/toggle`, { token });

export const getJWTExpiresDuration = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/token/expires`, { token });

export const updateJWTExpiresDuration = (token: string, duration: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/token/expires/update`, {
		method: 'POST',
		token,
		body: { duration }
	});

export const createAPIKey = async (token: string) => {
	const res = await apiFetch<{ api_key: string }>(`${WEBUI_API_BASE_URL}/auths/api_key`, {
		method: 'POST',
		token
	});
	return res.api_key;
};

export const getAPIKey = async (token: string) => {
	const res = await apiFetch<{ api_key: string }>(`${WEBUI_API_BASE_URL}/auths/api_key`, {
		token
	});
	return res.api_key;
};

export const deleteAPIKey = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/auths/api_key`, { method: 'DELETE', token });
