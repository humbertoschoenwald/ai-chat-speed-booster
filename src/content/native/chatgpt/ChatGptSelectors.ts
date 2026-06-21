export const CHATGPT_SECTION_TURN_SELECTOR = "section[data-testid^='conversation-turn-']";
export const CHATGPT_TURN_SELECTOR = `${CHATGPT_SECTION_TURN_SELECTOR},[data-turn-id-container],article[data-testid^='conversation-turn-']`;
export const CHATGPT_ERROR_SELECTOR = ".text-token-text-error, [data-testid*='error'], [aria-label*='Regenerate'], [aria-label*='Retry']";
export const CHATGPT_TOOL_SELECTOR = "[data-testid*='tool'], [data-message-author-role='tool']";
export const CHATGPT_STREAMING_SELECTOR = '[aria-label*="Stop"], [data-testid*="stop"], [data-is-streaming="true"], [aria-busy="true"]';
