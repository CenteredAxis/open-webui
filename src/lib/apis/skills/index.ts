import { fetchAPI } from '$lib/utils/api';

export const createNewSkill = async (token: string, skill: object) =>
	fetchAPI('/skills/create', { method: 'POST', token, body: { ...skill } });

export const getSkills = async (token: string = '') => fetchAPI('/skills/', { token });

export const getSkillList = async (token: string = '') => fetchAPI('/skills/list', { token });

export const getSkillItems = async (
	token: string = '',
	query: string | null = null,
	viewOption: string | null = null,
	page: number | null = null
) => fetchAPI('/skills/list', { token, params: { query, view_option: viewOption, page } });

export const exportSkills = async (token: string = '') => fetchAPI('/skills/export', { token });

export const getSkillById = async (token: string, id: string) =>
	fetchAPI(`/skills/id/${id}`, { token });

export const updateSkillById = async (token: string, id: string, skill: object) =>
	fetchAPI(`/skills/id/${id}/update`, { method: 'POST', token, body: { ...skill } });

export const updateSkillAccessGrants = async (token: string, id: string, accessGrants: any[]) =>
	fetchAPI(`/skills/id/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});

export const toggleSkillById = async (token: string, id: string) =>
	fetchAPI(`/skills/id/${id}/toggle`, { method: 'POST', token });

export const deleteSkillById = async (token: string, id: string) =>
	fetchAPI(`/skills/id/${id}/delete`, { method: 'DELETE', token });
