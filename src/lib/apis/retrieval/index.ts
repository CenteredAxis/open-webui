import { RETRIEVAL_API_BASE_URL } from '$lib/constants';
import { apiFetch } from '$lib/utils/api';

export const getRAGConfig = (token: string) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/config`, { token });

type ChunkConfigForm = {
	chunk_size: number;
	chunk_overlap: number;
};

type DocumentIntelligenceConfigForm = {
	key: string;
	endpoint: string;
	model: string;
};

type ContentExtractConfigForm = {
	engine: string;
	tika_server_url: string | null;
	document_intelligence_config: DocumentIntelligenceConfigForm | null;
};

type YoutubeConfigForm = {
	language: string[];
	translation?: string | null;
	proxy_url: string;
};

type RAGConfigForm = {
	PDF_EXTRACT_IMAGES?: boolean;
	ENABLE_GOOGLE_DRIVE_INTEGRATION?: boolean;
	ENABLE_ONEDRIVE_INTEGRATION?: boolean;
	chunk?: ChunkConfigForm;
	content_extraction?: ContentExtractConfigForm;
	web_loader_ssl_verification?: boolean;
	youtube?: YoutubeConfigForm;
};

export const updateRAGConfig = (token: string, payload: RAGConfigForm) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/config/update`, {
		method: 'POST',
		token,
		body: { ...payload }
	});

export const getQuerySettings = (token: string) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/query/settings`, { token });

type QuerySettings = {
	k: number | null;
	r: number | null;
	template: string | null;
};

export const updateQuerySettings = (token: string, settings: QuerySettings) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/query/settings/update`, {
		method: 'POST',
		token,
		body: { ...settings }
	});

export const getEmbeddingConfig = (token: string) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/embedding`, { token });

type OpenAIConfigForm = {
	key: string;
	url: string;
};

type AzureOpenAIConfigForm = {
	key: string;
	url: string;
	version: string;
};

type EmbeddingModelUpdateForm = {
	openai_config?: OpenAIConfigForm;
	azure_openai_config?: AzureOpenAIConfigForm;
	embedding_engine: string;
	embedding_model: string;
	embedding_batch_size?: number;
};

export const updateEmbeddingConfig = (token: string, payload: EmbeddingModelUpdateForm) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/embedding/update`, {
		method: 'POST',
		token,
		body: { ...payload }
	});

export const getRerankingConfig = (token: string) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/reranking`, { token });

type RerankingModelUpdateForm = {
	reranking_model: string;
};

export const updateRerankingConfig = (token: string, payload: RerankingModelUpdateForm) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/reranking/update`, {
		method: 'POST',
		token,
		body: { ...payload }
	});

export interface SearchDocument {
	status: boolean;
	collection_name: string;
	filenames: string[];
}

export const processYoutubeVideo = (token: string, url: string) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/process/youtube`, {
		method: 'POST',
		token,
		body: { url }
	});

export const processWeb = (
	token: string,
	collection_name: string,
	url: string,
	process: boolean = true
) => {
	const searchParams = new URLSearchParams();
	if (!process) {
		searchParams.append('process', 'false');
	}
	return apiFetch(`${RETRIEVAL_API_BASE_URL}/process/web?${searchParams.toString()}`, {
		method: 'POST',
		token,
		body: { url, collection_name }
	});
};

export const processWebSearch = (
	token: string,
	query: string,
	collection_name?: string
): Promise<SearchDocument | null> =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/process/web/search`, {
		method: 'POST',
		token,
		body: { query, collection_name: collection_name ?? '' }
	});

export const queryDoc = (
	token: string,
	collection_name: string,
	query: string,
	k: number | null = null
) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/query/doc`, {
		method: 'POST',
		token,
		body: { collection_name, query, k }
	});

export const queryCollection = (
	token: string,
	collection_names: string,
	query: string,
	k: number | null = null
) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/query/collection`, {
		method: 'POST',
		token,
		body: { collection_names, query, k }
	});

export const resetUploadDir = (token: string) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/reset/uploads`, { method: 'POST', token });

export const resetVectorDB = (token: string) =>
	apiFetch(`${RETRIEVAL_API_BASE_URL}/reset/db`, { method: 'POST', token });
