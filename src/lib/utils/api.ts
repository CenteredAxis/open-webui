import { WEBUI_API_BASE_URL } from '$lib/constants';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions {
	method?: HttpMethod;
	token?: string;
	body?: unknown;
	params?: Record<string, string | number | null | undefined>;
}

export async function fetchAPI<T = unknown>(
	path: string,
	{ method = 'GET', token, body, params }: FetchOptions = {}
): Promise<T> {
	let error = null;

	let url = `${WEBUI_API_BASE_URL}${path}`;
	if (params) {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== null && value !== undefined) {
				searchParams.append(key, String(value));
			}
		}
		const qs = searchParams.toString();
		if (qs) url += `?${qs}`;
	}

	const res = await fetch(url, {
		method,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token ? { authorization: `Bearer ${token}` } : {})
		},
		...(body !== undefined ? { body: JSON.stringify(body) } : {})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json() as T;
		})
		.catch((err) => {
			error = err.detail ?? err;
			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res as T;
}
