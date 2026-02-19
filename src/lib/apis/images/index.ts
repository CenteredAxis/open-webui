import { IMAGES_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const getConfig = (token: string = '') =>
	apiFetch(`${IMAGES_API_BASE_URL}/config`, { token });

export const updateConfig = (token: string = '', config: object) =>
	apiFetch(`${IMAGES_API_BASE_URL}/config/update`, { method: 'POST', token, body: { ...config } });

export const verifyConfigUrl = (token: string = '') =>
	apiFetch(`${IMAGES_API_BASE_URL}/config/url/verify`, { token });

export const getImageGenerationConfig = (token: string = '') =>
	apiFetch(`${IMAGES_API_BASE_URL}/image/config`, { token });

export const updateImageGenerationConfig = (token: string = '', config: object) =>
	apiFetch(`${IMAGES_API_BASE_URL}/image/config/update`, {
		method: 'POST',
		token,
		body: { ...config }
	});

export const getImageGenerationModels = (token: string = '') =>
	apiFetch(`${IMAGES_API_BASE_URL}/models`, { token });

export const imageGenerations = (token: string = '', prompt: string) =>
	apiFetch(`${IMAGES_API_BASE_URL}/generations`, { method: 'POST', token, body: { prompt } });

export const imageEdits = (
	token: string = '',
	images: string | string[],
	prompt: string,
	model?: string,
	size?: string,
	n?: number,
	background?: string
) =>
	apiFetch(`${IMAGES_API_BASE_URL}/edit`, {
		method: 'POST',
		token,
		body: {
			form_data: {
				image: images,
				prompt,
				...(model && { model }),
				...(size && { size }),
				...(n && { n }),
				...(background && { background })
			}
		}
	});
