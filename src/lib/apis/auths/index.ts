import { WEBUI_API_BASE_URL } from '$lib/constants';
import { fetchAPI } from '$lib/utils/api';

export const getAdminDetails = async (token: string) =>
	fetchAPI('/auths/admin/details', { token });

export const getAdminConfig = async (token: string) => fetchAPI('/auths/admin/config', { token });

export const updateAdminConfig = async (token: string, body: object) =>
	fetchAPI('/auths/admin/config', { method: 'POST', token, body });

// getSessionUser uses credentials: 'include' — keep as raw fetch
export const getSessionUser = async (token: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/auths/`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		credentials: 'include'
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

// ldapUserSignIn uses credentials: 'include' and no token — keep as raw fetch
export const ldapUserSignIn = async (user: string, password: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/auths/ldap`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({
			user: user,
			password: password
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);

			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const getLdapConfig = async (token: string = '') =>
	fetchAPI('/auths/admin/config/ldap', { token: token || undefined });

export const updateLdapConfig = async (token: string = '', enable_ldap: boolean) =>
	fetchAPI('/auths/admin/config/ldap', {
		method: 'POST',
		token: token || undefined,
		body: { enable_ldap }
	});

export const getLdapServer = async (token: string = '') =>
	fetchAPI('/auths/admin/config/ldap/server', { token: token || undefined });

export const updateLdapServer = async (token: string = '', body: object) =>
	fetchAPI('/auths/admin/config/ldap/server', {
		method: 'POST',
		token: token || undefined,
		body
	});

// userSignIn uses credentials: 'include' and no token — keep as raw fetch
export const userSignIn = async (email: string, password: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/auths/signin`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({
			email: email,
			password: password
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);

			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

// userSignUp uses credentials: 'include' and no token — keep as raw fetch
export const userSignUp = async (
	name: string,
	email: string,
	password: string,
	profile_image_url: string
) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/auths/signup`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({
			name: name,
			email: email,
			password: password,
			profile_image_url: profile_image_url
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

// userSignOut uses credentials: 'include', no token, and clears sessionStorage — keep as raw fetch
export const userSignOut = async () => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/auths/signout`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	sessionStorage.clear();
	return res;
};

export const addUser = async (
	token: string,
	name: string,
	email: string,
	password: string,
	role: string = 'pending',
	profile_image_url: null | string = null
) =>
	fetchAPI('/auths/add', {
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

export const updateUserProfile = async (token: string, profile: object) =>
	fetchAPI('/auths/update/profile', {
		method: 'POST',
		token: token || undefined,
		body: { ...profile }
	});

// updateUserTimezone uses fire-and-forget pattern — keep as raw fetch
export const updateUserTimezone = async (token: string, timezone: string) => {
	await fetch(`${WEBUI_API_BASE_URL}/auths/update/timezone`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify({ timezone })
	}).catch((err) => {
		console.error('Failed to update timezone:', err);
	});
};

export const updateUserPassword = async (token: string, password: string, newPassword: string) =>
	fetchAPI('/auths/update/password', {
		method: 'POST',
		token: token || undefined,
		body: { password, new_password: newPassword }
	});

export const getSignUpEnabledStatus = async (token: string) =>
	fetchAPI('/auths/signup/enabled', { token });

export const getDefaultUserRole = async (token: string) =>
	fetchAPI('/auths/signup/user/role', { token });

export const updateDefaultUserRole = async (token: string, role: string) =>
	fetchAPI('/auths/signup/user/role', { method: 'POST', token, body: { role } });

export const toggleSignUpEnabledStatus = async (token: string) =>
	fetchAPI('/auths/signup/enabled/toggle', { token });

export const getJWTExpiresDuration = async (token: string) =>
	fetchAPI('/auths/token/expires', { token });

export const updateJWTExpiresDuration = async (token: string, duration: string) =>
	fetchAPI('/auths/token/expires/update', { method: 'POST', token, body: { duration } });

// createAPIKey and getAPIKey return res.api_key, not the full response
export const createAPIKey = async (token: string) => {
	const res = await fetchAPI<{ api_key: string }>('/auths/api_key', { method: 'POST', token });
	return res.api_key;
};

export const getAPIKey = async (token: string) => {
	const res = await fetchAPI<{ api_key: string }>('/auths/api_key', { token });
	return res.api_key;
};

export const deleteAPIKey = async (token: string) =>
	fetchAPI('/auths/api_key', { method: 'DELETE', token });
