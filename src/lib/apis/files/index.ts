import { WEBUI_API_BASE_URL } from '$lib/constants';
import { splitStream } from '$lib/utils';
import { apiFetch } from '$lib/utils/api';

// uploadFile is skipped: uses SSE streaming via getFileProcessStatus (raw Response + ReadableStream)
export const uploadFile = async (
	token: string,
	file: File,
	metadata?: object | null,
	process?: boolean | null
) => {
	const data = new FormData();
	data.append('file', file);
	if (metadata) {
		data.append('metadata', JSON.stringify(metadata));
	}

	const searchParams = new URLSearchParams();
	if (process !== undefined && process !== null) {
		searchParams.append('process', String(process));
	}

	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/files/?${searchParams.toString()}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			authorization: `Bearer ${token}`
		},
		body: data
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err.detail || err.message;
			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	if (res) {
		const status = await getFileProcessStatus(token, res.id);

		if (status && status.ok) {
			const reader = status.body
				.pipeThrough(new TextDecoderStream())
				.pipeThrough(splitStream('\n'))
				.getReader();

			while (true) {
				const { value, done } = await reader.read();
				if (done) {
					break;
				}

				try {
					let lines = value.split('\n');

					for (const line of lines) {
						if (line !== '') {
							console.log(line);
							if (line === 'data: [DONE]') {
								console.log(line);
							} else {
								let data = JSON.parse(line.replace(/^data: /, ''));
								console.log(data);

								if (data?.error) {
									console.error(data.error);
									res.error = data.error;
								}

								if (res?.data) {
									res.data = data;
								}
							}
						}
					}
				} catch (error) {
					console.log(error);
				}
			}
		}
	}

	if (error) {
		throw error;
	}

	return res;
};

// getFileProcessStatus is skipped: returns a raw Response object used for SSE streaming
export const getFileProcessStatus = async (token: string, id: string) => {
	const queryParams = new URLSearchParams();
	queryParams.append('stream', 'true');

	let error = null;
	const res = await fetch(`${WEBUI_API_BASE_URL}/files/${id}/process/status?${queryParams}`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			authorization: `Bearer ${token}`
		}
	}).catch((err) => {
		error = err.detail;
		console.error(err);
		return null;
	});

	if (error) {
		throw error;
	}

	return res;
};

export const uploadDir = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/files/upload/dir`, { method: 'POST', token });

export const getFiles = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/files/`, { token });

export const searchFiles = (
	token: string,
	filename: string = '*',
	skip: number = 0,
	limit: number = 50
) => {
	const searchParams = new URLSearchParams();
	searchParams.append('filename', filename);
	searchParams.append('skip', String(skip));
	searchParams.append('limit', String(limit));

	return apiFetch(`${WEBUI_API_BASE_URL}/files/search?${searchParams.toString()}`, { token });
};

export const getFileById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/files/${id}`, { token });

export const updateFileDataContentById = (token: string, id: string, content: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/files/${id}/data/content/update`, {
		method: 'POST',
		token,
		body: { content }
	});

// getFileContentById is skipped: calls res.arrayBuffer() which is not supported by apiFetch
export const getFileContentById = async (id: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/files/${id}/content`, {
		method: 'GET',
		headers: {
			Accept: 'application/json'
		},
		credentials: 'include'
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return await res.arrayBuffer();
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

export const deleteFileById = (token: string, id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/files/${id}`, { method: 'DELETE', token });

export const deleteAllFiles = (token: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/files/all`, { method: 'DELETE', token });
