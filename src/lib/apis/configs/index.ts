import { WEBUI_BASE_URL } from '$lib/constants';
import type { Banner } from '$lib/types';
import { fetchAPI } from '$lib/utils/api';

export const importConfig = async (token: string, config) =>
	fetchAPI('/configs/import', { method: 'POST', token, body: { config } });

export const exportConfig = async (token: string) => fetchAPI('/configs/export', { token });

export const getConnectionsConfig = async (token: string) =>
	fetchAPI('/configs/connections', { token });

export const setConnectionsConfig = async (token: string, config: object) =>
	fetchAPI('/configs/connections', { method: 'POST', token, body: { ...config } });

export const getToolServerConnections = async (token: string) =>
	fetchAPI('/configs/tool_servers', { token });

export const setToolServerConnections = async (token: string, connections: object) =>
	fetchAPI('/configs/tool_servers', { method: 'POST', token, body: { ...connections } });

export const verifyToolServerConnection = async (token: string, connection: object) =>
	fetchAPI('/configs/tool_servers/verify', { method: 'POST', token, body: { ...connection } });

type RegisterOAuthClientForm = {
	url: string;
	client_id: string;
	client_name?: string;
};

export const registerOAuthClient = async (
	token: string,
	formData: RegisterOAuthClientForm,
	type: null | string = null
) =>
	fetchAPI(`/configs/oauth/clients/register${type ? `?type=${type}` : ''}`, {
		method: 'POST',
		token,
		body: { ...formData }
	});

export const getOAuthClientAuthorizationUrl = (clientId: string, type: null | string = null) => {
	const oauthClientId = type ? `${type}:${clientId}` : clientId;
	return `${WEBUI_BASE_URL}/oauth/clients/${oauthClientId}/authorize`;
};

export const getCodeExecutionConfig = async (token: string) =>
	fetchAPI('/configs/code_execution', { token });

export const setCodeExecutionConfig = async (token: string, config: object) =>
	fetchAPI('/configs/code_execution', { method: 'POST', token, body: { ...config } });

export const getModelsConfig = async (token: string) => fetchAPI('/configs/models', { token });

export const setModelsConfig = async (token: string, config: object) =>
	fetchAPI('/configs/models', { method: 'POST', token, body: { ...config } });

export const setDefaultPromptSuggestions = async (token: string, promptSuggestions: string) =>
	fetchAPI('/configs/suggestions', { method: 'POST', token, body: { suggestions: promptSuggestions } });

export const getBanners = async (token: string): Promise<Banner[]> =>
	fetchAPI('/configs/banners', { token });

export const setBanners = async (token: string, banners: Banner[]) =>
	fetchAPI('/configs/banners', { method: 'POST', token, body: { banners } });
