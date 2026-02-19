import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const getGravatarUrl = (token: string, email: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/utils/gravatar?email=${email}`, { token });

export const executeCode = (token: string, code: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/utils/code/execute`, {
		method: 'POST',
		token,
		body: { code }
	});

export const formatPythonCode = (token: string, code: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/utils/code/format`, {
		method: 'POST',
		token,
		body: { code }
	});

export const downloadChatAsPDF = (token: string, title: string, messages: object[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/utils/pdf`, {
		method: 'POST',
		token,
		body: { title, messages },
		responseType: 'blob'
	});

export const getHTMLFromMarkdown = async (token: string, md: string) => {
	const res = await apiFetch<{ html: string }>(`${WEBUI_API_BASE_URL}/utils/markdown`, {
		method: 'POST',
		token,
		body: { md }
	});
	return res.html;
};

export const downloadDatabase = async (token: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/utils/db/download`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	})
		.then(async (response) => {
			if (!response.ok) {
				throw await response.json();
			}
			return response.blob();
		})
		.then((blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'webui.db';
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
		})
		.catch((err) => {
			console.error(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}
};
