import { OPENAI_API_BASE_URL, WEBUI_API_BASE_URL, WEBUI_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const getOpenAIConfig = (token: string = '') =>
	apiFetch(`${OPENAI_API_BASE_URL}/config`, { token });

type OpenAIConfig = {
	ENABLE_OPENAI_API: boolean;
	OPENAI_API_BASE_URLS: string[];
	OPENAI_API_KEYS: string[];
	OPENAI_API_CONFIGS: object;
};

export const updateOpenAIConfig = (token: string = '', config: OpenAIConfig) =>
	apiFetch(`${OPENAI_API_BASE_URL}/config/update`, {
		method: 'POST',
		token,
		body: { ...config }
	});

export const getOpenAIUrls = async (token: string = '') => {
	const res = await apiFetch<{ OPENAI_API_BASE_URLS?: string[] }>(`${OPENAI_API_BASE_URL}/urls`, {
		token
	});
	return res?.OPENAI_API_BASE_URLS ?? [];
};

export const updateOpenAIUrls = async (token: string = '', urls: string[]) => {
	const res = await apiFetch<{ OPENAI_API_BASE_URLS: string[] }>(
		`${OPENAI_API_BASE_URL}/urls/update`,
		{ method: 'POST', token, body: { urls } }
	);
	return res.OPENAI_API_BASE_URLS;
};

export const getOpenAIKeys = async (token: string = '') => {
	const res = await apiFetch<{ OPENAI_API_KEYS?: string[] }>(`${OPENAI_API_BASE_URL}/keys`, {
		token
	});
	return res?.OPENAI_API_KEYS ?? [];
};

export const updateOpenAIKeys = async (token: string = '', keys: string[]) => {
	const res = await apiFetch<{ OPENAI_API_KEYS: string[] }>(
		`${OPENAI_API_BASE_URL}/keys/update`,
		{ method: 'POST', token, body: { keys } }
	);
	return res.OPENAI_API_KEYS;
};

export const getOpenAIModelsDirect = (url: string, key: string) =>
	apiFetch(`${url}/models`, { token: key });

export const getOpenAIModels = (token: string, urlIdx?: number) =>
	apiFetch(`${OPENAI_API_BASE_URL}/models${typeof urlIdx === 'number' ? `/${urlIdx}` : ''}`, {
		token
	});

export const verifyOpenAIConnection = async (
	token: string = '',
	connection: dict = {},
	direct: boolean = false
) => {
	const { url, key, config } = connection;
	if (!url) {
		throw 'OpenAI: URL is required';
	}

	if (direct) {
		return apiFetch(`${url}/models`, { token: key });
	} else {
		return apiFetch(`${OPENAI_API_BASE_URL}/verify`, {
			method: 'POST',
			token,
			body: { url, key, config }
		});
	}
};

export const chatCompletion = async (
	token: string = '',
	body: object,
	url: string = `${WEBUI_BASE_URL}/api`
): Promise<[Response | null, AbortController]> => {
	const controller = new AbortController();
	let error = null;

	const res = await fetch(`${url}/chat/completions`, {
		signal: controller.signal,
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	}).catch((err) => {
		console.error(err);
		error = err;
		return null;
	});

	if (error) {
		throw error;
	}

	return [res, controller];
};

export const generateOpenAIChatCompletion = async (
	token: string = '',
	body: object,
	url: string = `${WEBUI_BASE_URL}/api`
) => {
	let error = null;

	const res = await fetch(`${url}/chat/completions`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(body)
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err?.detail ?? err;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const synthesizeOpenAISpeech = async (
	token: string = '',
	speaker: string = 'alloy',
	text: string = '',
	model: string = 'tts-1'
) => {
	let error = null;

	const res = await fetch(`${OPENAI_API_BASE_URL}/audio/speech`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: model,
			input: text,
			voice: speaker
		})
	}).catch((err) => {
		console.error(err);
		error = err;
		return null;
	});

	if (error) {
		throw error;
	}

	return res;
};
