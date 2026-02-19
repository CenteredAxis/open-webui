import { AUDIO_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const getAudioConfig = (token: string) =>
	apiFetch(`${AUDIO_API_BASE_URL}/config`, { token });

type OpenAIConfigForm = {
	url: string;
	key: string;
	model: string;
	speaker: string;
};

export const updateAudioConfig = (token: string, payload: OpenAIConfigForm) =>
	apiFetch(`${AUDIO_API_BASE_URL}/config/update`, { method: 'POST', token, body: { ...payload } });

export const transcribeAudio = async (token: string, file: File, language?: string) => {
	const data = new FormData();
	data.append('file', file);
	if (language) {
		data.append('language', language);
	}

	return apiFetch(`${AUDIO_API_BASE_URL}/transcriptions`, { method: 'POST', token, body: data });
};

export const synthesizeOpenAISpeech = async (
	token: string = '',
	speaker: string = 'alloy',
	text: string = '',
	model?: string
) => {
	let error = null;

	const res = await fetch(`${AUDIO_API_BASE_URL}/speech`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			input: text,
			voice: speaker,
			...(model && { model })
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res;
		})
		.catch((err) => {
			error = err.detail;
			console.error(err);

			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

interface AvailableModelsResponse {
	models: { name: string; id: string }[] | { id: string }[];
}

export const getModels = (token: string = ''): Promise<AvailableModelsResponse> =>
	apiFetch(`${AUDIO_API_BASE_URL}/models`, { token });

export const getVoices = (token: string = '') =>
	apiFetch(`${AUDIO_API_BASE_URL}/voices`, { token });
