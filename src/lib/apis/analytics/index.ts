import { fetchAPI } from '$lib/utils/api';

export const getModelAnalytics = async (
	token: string = '',
	startDate: number | null = null,
	endDate: number | null = null,
	groupId: string | null = null
) =>
	fetchAPI('/analytics/models', {
		token,
		params: { start_date: startDate, end_date: endDate, group_id: groupId }
	});

export const getUserAnalytics = async (
	token: string = '',
	startDate: number | null = null,
	endDate: number | null = null,
	limit: number = 50,
	groupId: string | null = null
) =>
	fetchAPI('/analytics/users', {
		token,
		params: { start_date: startDate, end_date: endDate, limit, group_id: groupId }
	});

export const getMessages = async (
	token: string = '',
	modelId: string | null = null,
	userId: string | null = null,
	chatId: string | null = null,
	startDate: number | null = null,
	endDate: number | null = null,
	skip: number = 0,
	limit: number = 50
) =>
	fetchAPI('/analytics/messages', {
		token,
		params: {
			model_id: modelId,
			user_id: userId,
			chat_id: chatId,
			start_date: startDate,
			end_date: endDate,
			skip: skip || undefined,
			limit: limit || undefined
		}
	});

export const getSummary = async (
	token: string = '',
	startDate: number | null = null,
	endDate: number | null = null,
	groupId: string | null = null
) =>
	fetchAPI('/analytics/summary', {
		token,
		params: { start_date: startDate, end_date: endDate, group_id: groupId }
	});

export const getDailyStats = async (
	token: string = '',
	startDate: number | null = null,
	endDate: number | null = null,
	granularity: 'hourly' | 'daily' = 'daily',
	groupId: string | null = null
) =>
	fetchAPI('/analytics/daily', {
		token,
		params: { start_date: startDate, end_date: endDate, granularity, group_id: groupId }
	});

export const getTokenUsage = async (
	token: string = '',
	startDate: number | null = null,
	endDate: number | null = null,
	groupId: string | null = null
) =>
	fetchAPI('/analytics/tokens', {
		token,
		params: { start_date: startDate, end_date: endDate, group_id: groupId }
	});

export const getModelChats = async (
	token: string = '',
	modelId: string,
	startDate: number | null = null,
	endDate: number | null = null,
	skip: number = 0,
	limit: number = 50
) =>
	fetchAPI(`/analytics/models/${encodeURIComponent(modelId)}/chats`, {
		token,
		params: {
			start_date: startDate,
			end_date: endDate,
			skip: skip || undefined,
			limit: limit || undefined
		}
	});

export const getModelOverview = async (token: string = '', modelId: string, days: number = 30) =>
	fetchAPI(`/analytics/models/${encodeURIComponent(modelId)}/overview`, {
		token,
		params: { days }
	});
