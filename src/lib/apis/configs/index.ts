import { WEBUI_API_BASE_URL, WEBUI_BASE_URL } from '$lib/constants';
import type { Banner } from '$lib/types';
import { apiFetch } from '$lib/utils/api';

export const importConfig = (token: string, config) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/import`, {
		method: 'POST',
		token,
		body: { config }
	});

export const exportConfig = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/export`, { token });

export const getConnectionsConfig = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/connections`, { token });

export const setConnectionsConfig = (token: string, config: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/connections`, {
		method: 'POST',
		token,
		body: { ...config }
	});

export const getToolServerConnections = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/tool_servers`, { token });

export const setToolServerConnections = (token: string, connections: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/tool_servers`, {
		method: 'POST',
		token,
		body: { ...connections }
	});

export const verifyToolServerConnection = (token: string, connection: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/tool_servers/verify`, {
		method: 'POST',
		token,
		body: { ...connection }
	});

type RegisterOAuthClientForm = {
	url: string;
	client_id: string;
	client_name?: string;
};

export const registerOAuthClient = (
	token: string,
	formData: RegisterOAuthClientForm,
	type: null | string = null
) => {
	const searchParams = type ? `?type=${type}` : '';
	return apiFetch(`${WEBUI_API_BASE_URL}/configs/oauth/clients/register${searchParams}`, {
		method: 'POST',
		token,
		body: { ...formData }
	});
};

export const getOAuthClientAuthorizationUrl = (clientId: string, type: null | string = null) => {
	const oauthClientId = type ? `${type}:${clientId}` : clientId;
	return `${WEBUI_BASE_URL}/oauth/clients/${oauthClientId}/authorize`;
};

export const getCodeExecutionConfig = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/code_execution`, { token });

export const setCodeExecutionConfig = (token: string, config: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/code_execution`, {
		method: 'POST',
		token,
		body: { ...config }
	});

export const getModelsConfig = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/models`, { token });

export const setModelsConfig = (token: string, config: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/models`, {
		method: 'POST',
		token,
		body: { ...config }
	});

export const setDefaultPromptSuggestions = (token: string, promptSuggestions: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/suggestions`, {
		method: 'POST',
		token,
		body: { suggestions: promptSuggestions }
	});

export const getBanners = (token: string): Promise<Banner[]> =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/banners`, { token });

export const setBanners = (token: string, banners: Banner[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/configs/banners`, {
		method: 'POST',
		token,
		body: { banners }
	});
