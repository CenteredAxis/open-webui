import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const getConfig = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/evaluations/config`, { token });

export const updateConfig = (token: string, config: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/evaluations/config`, {
		method: 'POST',
		token,
		body: { ...config }
	});

export const getAllFeedbacks = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/evaluations/feedbacks/all`, { token });

export const getLeaderboard = (token: string = '', query: string = '') => {
	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);

	return apiFetch(`${WEBUI_API_BASE_URL}/evaluations/leaderboard?${searchParams.toString()}`, {
		token
	});
};

export const getModelHistory = (token: string = '', modelId: string, days: number = 30) => {
	const searchParams = new URLSearchParams();
	searchParams.append('days', days.toString());

	return apiFetch(
		`${WEBUI_API_BASE_URL}/evaluations/leaderboard/${encodeURIComponent(modelId)}/history?${searchParams.toString()}`,
		{ token }
	);
};

export const getFeedbackItems = (token: string = '', orderBy, direction, page) => {
	const searchParams = new URLSearchParams();
	if (orderBy) searchParams.append('order_by', orderBy);
	if (direction) searchParams.append('direction', direction);
	if (page) searchParams.append('page', page.toString());

	return apiFetch(
		`${WEBUI_API_BASE_URL}/evaluations/feedbacks/list?${searchParams.toString()}`,
		{ token }
	);
};

export const exportAllFeedbacks = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/evaluations/feedbacks/all/export`, { token });

export const createNewFeedback = (token: string, feedback: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/evaluations/feedback`, {
		method: 'POST',
		token,
		body: { ...feedback }
	});

export const getFeedbackById = (token: string, feedbackId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/evaluations/feedback/${feedbackId}`, { token });

export const updateFeedbackById = (token: string, feedbackId: string, feedback: object) =>
	apiFetch(`${WEBUI_API_BASE_URL}/evaluations/feedback/${feedbackId}`, {
		method: 'POST',
		token,
		body: { ...feedback }
	});

export const deleteFeedbackById = (token: string, feedbackId: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/evaluations/feedback/${feedbackId}`, {
		method: 'DELETE',
		token
	});
