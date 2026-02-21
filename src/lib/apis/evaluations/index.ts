import { fetchAPI } from '$lib/utils/api';

export const getConfig = async (token: string = '') =>
	fetchAPI('/evaluations/config', { token });

export const updateConfig = async (token: string, config: object) =>
	fetchAPI('/evaluations/config', { method: 'POST', token, body: { ...config } });

export const getAllFeedbacks = async (token: string = '') =>
	fetchAPI('/evaluations/feedbacks/all', { token });

export const getLeaderboard = async (token: string = '', query: string = '') =>
	fetchAPI('/evaluations/leaderboard', { token, params: { query: query || undefined } });

export const getModelHistory = async (token: string = '', modelId: string, days: number = 30) =>
	fetchAPI(`/evaluations/leaderboard/${encodeURIComponent(modelId)}/history`, {
		token,
		params: { days }
	});

export const getFeedbackItems = async (token: string = '', orderBy, direction, page) =>
	fetchAPI('/evaluations/feedbacks/list', { token, params: { order_by: orderBy, direction, page } });

export const exportAllFeedbacks = async (token: string = '') =>
	fetchAPI('/evaluations/feedbacks/all/export', { token });

export const createNewFeedback = async (token: string, feedback: object) =>
	fetchAPI('/evaluations/feedback', { method: 'POST', token, body: { ...feedback } });

export const getFeedbackById = async (token: string, feedbackId: string) =>
	fetchAPI(`/evaluations/feedback/${feedbackId}`, { token });

export const updateFeedbackById = async (token: string, feedbackId: string, feedback: object) =>
	fetchAPI(`/evaluations/feedback/${feedbackId}`, {
		method: 'POST',
		token,
		body: { ...feedback }
	});

export const deleteFeedbackById = async (token: string, feedbackId: string) =>
	fetchAPI(`/evaluations/feedback/${feedbackId}`, { method: 'DELETE', token });
