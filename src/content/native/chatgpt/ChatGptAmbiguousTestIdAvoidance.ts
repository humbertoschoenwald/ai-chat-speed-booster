export interface ChatGptAmbiguousTestIdSnapshot {
    readonly ambiguousTestIdCount: number;
    readonly ambiguousValues: readonly string[];
}

const AMBIGUOUS_TEST_ID_VALUES = new Set([
    "tool",
    "tools",
    "error",
    "retry",
    "option",
    "menu-item",
    "more-options",
]);
const UNIQUE_TEST_ID_PREFIXES = ["conversation-turn-"];

export function readUnambiguousChatGptTestId(element: HTMLElement): string | null {
    const value = element.getAttribute("data-testid")?.trim() ?? "";
    if (!value) return null;
    if (UNIQUE_TEST_ID_PREFIXES.some((prefix) => value.startsWith(prefix))) return value;
    if (isAmbiguousChatGptTestIdValue(value)) return null;
    return null;
}

export function inspectChatGptAmbiguousTestIds(root: ParentNode): ChatGptAmbiguousTestIdSnapshot {
    const values = Array.from(root.querySelectorAll?.<HTMLElement>("[data-testid]") ?? [])
        .map((element) => element.getAttribute("data-testid")?.trim() ?? "")
        .filter(isAmbiguousChatGptTestIdValue);
    return {
        ambiguousTestIdCount: values.length,
        ambiguousValues: [...new Set(values)].sort(),
    };
}

export function isAmbiguousChatGptTestIdValue(value: string): boolean {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    if (UNIQUE_TEST_ID_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return false;
    if (AMBIGUOUS_TEST_ID_VALUES.has(normalized)) return true;
    return normalized.includes("tool") || normalized.includes("error") || normalized.includes("option");
}
