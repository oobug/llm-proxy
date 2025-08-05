import { config } from '../config';

const OPENAI_API_BASE_URL = config.openaiBaseUrl || 'https://api.openai.com/v1';

/**
 * Sends a streaming chat completion request to the OpenAI API via raw fetch
 * and processes the Server-Sent Events (SSE) stream manually.
 *
 * @param payload request payload for OpenAI's chat completion endpoint (must include model, messages).
 * @param onChunk callback function called for each raw SSE data chunk received from OpenAI.
 *
 * @throws Will throw an error if the OpenAI API response is not successful or if the response stream is missing.
 */
const fetchOpenaiResponse = async (
	payload: Record<string, any>,
	onChunk?: (line: string) => void,
	organizationId?: string
): Promise<void> => {
	if (!config.openaiApiKey) {
		throw new Error('OpenAI API key is not configured.');
	}

	const headers: Record<string, string> = {
		Authorization: `Bearer ${config.openaiApiKey}`,
		'Content-Type': 'application/json',
	};
	if (organizationId) {
		headers['OpenAI-Organization'] = organizationId;
	}

	const url = `${OPENAI_API_BASE_URL}/chat/completions`;

	const response = await fetch(url, {
		body: JSON.stringify(payload),
		headers,
		method: 'POST',
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
	}

	if (payload.stream) {
		const reader = response.body!.getReader();
		const decoder = new TextDecoder('utf-8');
		let buffer = '';

		while (true) {
			const { value, done } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop()!;

			for (const line of lines) {
				const trimmed = line.trim();
				if (trimmed.startsWith('data: ') && onChunk) {
					onChunk(trimmed);
				}
			}
		}
		return;
	} else {
		const json = await response.json();
		return json;
	}
};

export { fetchOpenaiResponse };
