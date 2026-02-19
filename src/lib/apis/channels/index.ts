import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

type ChannelForm = {
	type?: string;
	name: string;
	is_private?: boolean | null;
	data?: object;
	meta?: object;
	access_grants?: object[];
	group_ids?: string[];
	user_ids?: string[];
};

export const createNewChannel = (token: string = '', channel: ChannelForm) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/create`, {
		method: 'POST',
		token: token || undefined,
		body: { ...channel } as Record<string, unknown>
	});

export const getChannels = (token: string = '') =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/`, { token: token || undefined });

export const getChannelById = (token: string = '', channel_id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}`, { token: token || undefined });

export const getDMChannelByUserId = (token: string = '', user_id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/users/${user_id}`, { token: token || undefined });

export const getChannelMembersById = (
	token: string,
	channel_id: string,
	query?: string,
	orderBy?: string,
	direction?: string,
	page = 1
) => {
	const searchParams = new URLSearchParams();

	searchParams.set('page', `${page}`);

	if (query) {
		searchParams.set('query', query);
	}

	if (orderBy) {
		searchParams.set('order_by', orderBy);
	}

	if (direction) {
		searchParams.set('direction', direction);
	}

	return apiFetch(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/members?${searchParams.toString()}`,
		{ token }
	);
};

export const updateChannelMemberActiveStatusById = (
	token: string = '',
	channel_id: string,
	is_active: boolean
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/members/active`, {
		method: 'POST',
		token: token || undefined,
		body: { is_active }
	});

type UpdateMembersForm = {
	user_ids?: string[];
	group_ids?: string[];
};

export const addMembersById = (
	token: string = '',
	channel_id: string,
	formData: UpdateMembersForm
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/update/members/add`, {
		method: 'POST',
		token: token || undefined,
		body: { ...formData }
	});

type RemoveMembersForm = {
	user_ids?: string[];
	group_ids?: string[];
};

export const removeMembersById = (
	token: string = '',
	channel_id: string,
	formData: RemoveMembersForm
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/update/members/remove`, {
		method: 'POST',
		token: token || undefined,
		body: { ...formData }
	});

export const updateChannelById = (
	token: string = '',
	channel_id: string,
	channel: ChannelForm
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/update`, {
		method: 'POST',
		token: token || undefined,
		body: { ...channel } as Record<string, unknown>
	});

export const deleteChannelById = (token: string = '', channel_id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/delete`, {
		method: 'DELETE',
		token: token || undefined
	});

export const getChannelMessages = (
	token: string = '',
	channel_id: string,
	skip: number = 0,
	limit: number = 50
) =>
	apiFetch(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages?skip=${skip}&limit=${limit}`,
		{ token: token || undefined }
	);

export const getChannelPinnedMessages = (
	token: string = '',
	channel_id: string,
	page: number = 1
) =>
	apiFetch(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/pinned?page=${page}`,
		{ token: token || undefined }
	);

export const getChannelThreadMessages = (
	token: string = '',
	channel_id: string,
	message_id: string,
	skip: number = 0,
	limit: number = 50
) =>
	apiFetch(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/thread?skip=${skip}&limit=${limit}`,
		{ token: token || undefined }
	);

export const getMessageData = (
	token: string = '',
	channel_id: string,
	message_id: string
) =>
	apiFetch(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/data`,
		{ token: token || undefined }
	);

type MessageForm = {
	temp_id?: string;
	reply_to_id?: string;
	parent_id?: string;
	content: string;
	data?: object;
	meta?: object;
};

export const sendMessage = (token: string = '', channel_id: string, message: MessageForm) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/post`, {
		method: 'POST',
		token: token || undefined,
		body: { ...message } as Record<string, unknown>
	});

export const pinMessage = (
	token: string = '',
	channel_id: string,
	message_id: string,
	is_pinned: boolean
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/pin`, {
		method: 'POST',
		token: token || undefined,
		body: { is_pinned }
	});

export const updateMessage = (
	token: string = '',
	channel_id: string,
	message_id: string,
	message: MessageForm
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/update`, {
		method: 'POST',
		token: token || undefined,
		body: { ...message } as Record<string, unknown>
	});

export const addReaction = (
	token: string = '',
	channel_id: string,
	message_id: string,
	name: string
) =>
	apiFetch(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/reactions/add`,
		{
			method: 'POST',
			token: token || undefined,
			body: { name }
		}
	);

export const removeReaction = (
	token: string = '',
	channel_id: string,
	message_id: string,
	name: string
) =>
	apiFetch(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/reactions/remove`,
		{
			method: 'POST',
			token: token || undefined,
			body: { name }
		}
	);

export const deleteMessage = (token: string = '', channel_id: string, message_id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/delete`, {
		method: 'DELETE',
		token: token || undefined
	});

// Webhook API functions

type WebhookForm = {
	name: string;
	profile_image_url?: string;
};

export const getChannelWebhooks = (token: string = '', channel_id: string) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/webhooks`, {
		token: token || undefined
	});

export const createChannelWebhook = (
	token: string = '',
	channel_id: string,
	formData: WebhookForm
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/webhooks/create`, {
		method: 'POST',
		token: token || undefined,
		body: { ...formData }
	});

export const updateChannelWebhook = (
	token: string = '',
	channel_id: string,
	webhook_id: string,
	formData: WebhookForm
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/webhooks/${webhook_id}/update`, {
		method: 'POST',
		token: token || undefined,
		body: { ...formData }
	});

export const deleteChannelWebhook = (
	token: string = '',
	channel_id: string,
	webhook_id: string
) =>
	apiFetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/webhooks/${webhook_id}/delete`, {
		method: 'DELETE',
		token: token || undefined
	});
