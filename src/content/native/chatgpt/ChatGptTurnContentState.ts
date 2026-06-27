import { CHATGPT_ERROR_SELECTOR, CHATGPT_STREAMING_SELECTOR, CHATGPT_TOOL_SELECTOR } from "./ChatGptSelectors";
import { type NativeTurnRecord, type TurnRegistry } from "../TurnRegistry";

export type ChatGptTurnContentState = "placeholder" | "hydrated" | "active" | "status";

export interface ChatGptTurnContentStateSnapshot {
    readonly placeholderTurns: number;
    readonly hydratedTurns: number;
    readonly activeTurns: number;
    readonly statusTurns: number;
}

const INTERACTIVE_OR_VISUAL_SELECTOR = "button,[role='button'],a[href],svg,img,canvas,pre,code";
const BUSY_SELECTOR = `.loading-shimmer,.animate-spin,[aria-busy='true'],[data-is-streaming='true'],${CHATGPT_STREAMING_SELECTOR}`;

export function classifyChatGptTurnContentState(turn: HTMLElement): ChatGptTurnContentState {
    if (turn.querySelector(CHATGPT_ERROR_SELECTOR)) return "status";
    if (turn.querySelector(CHATGPT_TOOL_SELECTOR) || turn.querySelector(BUSY_SELECTOR)) return "active";
    const text = (turn.innerText || turn.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length > 0) return "hydrated";
    if (turn.querySelector(INTERACTIVE_OR_VISUAL_SELECTOR)) return "hydrated";
    return "placeholder";
}

export function updateChatGptTurnContentState(
    registry: TurnRegistry,
    record: NativeTurnRecord,
): ChatGptTurnContentState {
    const state = classifyChatGptTurnContentState(record.element);
    if (state === "placeholder") {
        registry.attachPlaceholder(record, record.element);
        return state;
    }
    if (record.hydrationState === "placeholder") registry.markHydrated(record);
    return state;
}

export function summarizeChatGptTurnContentStates(states: readonly ChatGptTurnContentState[]): ChatGptTurnContentStateSnapshot {
    return {
        placeholderTurns: states.filter((state) => state === "placeholder").length,
        hydratedTurns: states.filter((state) => state === "hydrated").length,
        activeTurns: states.filter((state) => state === "active").length,
        statusTurns: states.filter((state) => state === "status").length,
    };
}
