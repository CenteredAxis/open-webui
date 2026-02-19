import { WEBUI_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const checkActiveChats = (token: string, chatIds: string[]) =>
	apiFetch(`${WEBUI_API_BASE_URL}/tasks/active/chats`, {
		method: 'POST',
		token,
		body: { chat_ids: chatIds }
	});
