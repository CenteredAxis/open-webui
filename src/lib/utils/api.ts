/**
 * Thin fetch wrapper used by all API client modules.
 *
 * Handles: JSON/blob/text responses, Bearer token auth, FormData uploads,
 * optional token (omits Authorization header when token is falsy), and
 * consistent error extraction (err?.detail ?? err).
 *
 * Functions that stream, return raw Response objects, or need custom
 * request construction should not use this wrapper.
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ApiOptions = {
	method?: HttpMethod;
	token?: string;
	body?: Record<string, unknown> | unknown[] | FormData;
	responseType?: 'json' | 'blob' | 'text';
};

export const apiFetch = async <T = unknown>(
	url: string,
	options: ApiOptions = {}
): Promise<T> => {
	const { method = 'GET', token, body, responseType = 'json' } = options;
	const isFormData = body instanceof FormData;

	const headers: Record<string, string> = {
		Accept: 'application/json',
		// Content-Type is intentionally omitted for FormData so the browser
		// can set the correct multipart boundary automatically.
		...(isFormData ? {} : { 'Content-Type': 'application/json' }),
		// Authorization is omitted when token is falsy (public endpoints).
		...(token ? { authorization: `Bearer ${token}` } : {})
	};

	let error = null;

	const res = await fetch(url, {
		method,
		headers,
		...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			if (responseType === 'blob') return res.blob() as unknown as T;
			if (responseType === 'text') return res.text() as unknown as T;
			return res.json() as T;
		})
		.catch((err) => {
			// err?.detail ?? err: surfaces the FastAPI detail string when present,
			// otherwise falls back to the full error object (avoids throwing undefined).
			error = err?.detail ?? err;
			console.error(err);
			return null;
		});

	if (error) throw error;
	return res as T;
};
