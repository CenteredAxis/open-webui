import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const createNewSkill = (token: string, skill: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/skills/create`, { method: 'POST', token, body: { ...skill } });

export const getSkills = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/skills/`, { token });

export const getSkillList = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/skills/list`, { token });

export const getSkillItems = (
	token: string = '',
	query: string | null = null,
	viewOption: string | null = null,
	page: number | null = null
) => {
	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);
	if (viewOption) searchParams.append('view_option', viewOption);
	if (page) searchParams.append('page', page.toString());

	return apiFetch(`${WEBUI_API_BASE_URL}/skills/list?${searchParams.toString()}`, { token });
};

export const exportSkills = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/skills/export`, { token });

export const getSkillById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/skills/id/${id}`, { token });

export const updateSkillById = (token: string, id: string, skill: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/skills/id/${id}/update`, {
		method: 'POST',
		token,
		body: { ...skill }
	});

export const updateSkillAccessGrants = (token: string, id: string, accessGrants: any[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/skills/id/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});

export const toggleSkillById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/skills/id/${id}/toggle`, { method: 'POST', token });

export const deleteSkillById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/skills/id/${id}/delete`, { method: 'DELETE', token });
