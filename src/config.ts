import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
	geminiApiKey: process.env.GEMINI_API_KEY!,
	geminiBaseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
	openaiApiKey: process.env.OPENAI_API_KEY!,
	openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
	openaiUrlParams: process.env.OPENAI_URL_PARAMS!,
	port: process.env.PORT || 8000,
};
