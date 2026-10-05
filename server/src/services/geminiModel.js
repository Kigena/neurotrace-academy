export const DEFAULT_MODEL = 'gemini-3.5-flash';
export const DEFAULT_FALLBACK_MODEL = 'gemini-3.5-flash-lite';

const RETRYABLE_STATUS = new Set([404, 429, 500, 503]);
const RETRYABLE_TEXT = /\b(404|429|500|503)\b|no longer available|overloaded|high demand|quota|UNAVAILABLE/i;

/** True for errors where trying another model can help (retired model, rate limit, overload). */
export function isRetryable(error) {
    const status = error?.status ?? error?.statusCode ?? error?.response?.status;
    if (RETRYABLE_STATUS.has(Number(status))) return true;
    return RETRYABLE_TEXT.test(String(error?.message || ''));
}

/**
 * Wraps a GoogleGenerativeAI client so `startChat(opts).sendMessage(msg)` tries the primary model first
 * and falls back to the backup model when the primary is retired, rate limited or overloaded.
 */
export function createResilientModel(genAI, { primary = DEFAULT_MODEL, fallback = DEFAULT_FALLBACK_MODEL } = {}) {
    const models = [primary, fallback].filter((name, i, all) => name && all.indexOf(name) === i);

    return {
        models,
        startChat(options) {
            const chats = new Map();
            const chatFor = (name) => {
                if (!chats.has(name)) chats.set(name, genAI.getGenerativeModel({ model: name }).startChat(options));
                return chats.get(name);
            };
            return {
                async sendMessage(message) {
                    let lastError;
                    for (let i = 0; i < models.length; i++) {
                        try {
                            return await chatFor(models[i]).sendMessage(message);
                        } catch (error) {
                            lastError = error;
                            const hasNext = i < models.length - 1;
                            if (!hasNext || !isRetryable(error)) throw error;
                            console.warn(`⚠️ Gemini model ${models[i]} failed (${error?.status ?? error?.message}); trying ${models[i + 1]}`);
                        }
                    }
                    throw lastError;
                },
            };
        },
    };
}
