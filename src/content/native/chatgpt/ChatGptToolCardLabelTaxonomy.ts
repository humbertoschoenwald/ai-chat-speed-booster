export type ChatGptToolCardLabelKind =
    | "completed"
    | "active"
    | "lookup-status"
    | "collapsed-control"
    | "expanded-control"
    | "unknown";

export interface ChatGptToolCardLabelClassification {
    readonly kind: ChatGptToolCardLabelKind;
    readonly label: string;
    readonly staticSummaryEligible: boolean;
}

const LOOKUP_STATUS_PATTERNS = [
    /looked for available tools/i,
    /looking for available tools/i,
    /looked for tools/i,
    /available tools/i,
];
const ACTIVE_PATTERNS = [
    /calling tool/i,
    /working on it/i,
    /running tool/i,
    /using tool/i,
];
const COMPLETED_PATTERNS = [
    /called tool/i,
    /used tool/i,
    /tool completed/i,
    /ran tool/i,
    /read file/i,
    /opened/i,
    /searched/i,
    /fetched/i,
];
const COLLAPSED_CONTROL_PATTERNS = [
    /open tool call list/i,
    /open tool calls/i,
    /show tool calls/i,
];
const EXPANDED_CONTROL_PATTERNS = [
    /close tool call list/i,
    /hide tool calls/i,
];

export function classifyChatGptToolCardLabel(label: string): ChatGptToolCardLabelClassification {
    const normalized = normalizeToolCardLabel(label);
    if (!normalized) return unknown(normalized);
    if (LOOKUP_STATUS_PATTERNS.some((pattern) => pattern.test(normalized))) {
        return { kind: "lookup-status", label: normalized, staticSummaryEligible: false };
    }
    if (ACTIVE_PATTERNS.some((pattern) => pattern.test(normalized))) {
        return { kind: "active", label: normalized, staticSummaryEligible: false };
    }
    if (EXPANDED_CONTROL_PATTERNS.some((pattern) => pattern.test(normalized))) {
        return { kind: "expanded-control", label: normalized, staticSummaryEligible: false };
    }
    if (COLLAPSED_CONTROL_PATTERNS.some((pattern) => pattern.test(normalized))) {
        return { kind: "collapsed-control", label: normalized, staticSummaryEligible: false };
    }
    if (COMPLETED_PATTERNS.some((pattern) => pattern.test(normalized))) {
        return { kind: "completed", label: normalized, staticSummaryEligible: true };
    }
    return unknown(normalized);
}

export function normalizeToolCardLabel(label: string): string {
    return label.replace(/\s+/g, " ").trim();
}

function unknown(label: string): ChatGptToolCardLabelClassification {
    return { kind: "unknown", label, staticSummaryEligible: false };
}
