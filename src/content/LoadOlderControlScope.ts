const LOAD_OLDER_CONTROL_SELECTOR = [
    ".acsb-load-more-wrapper",
    ".acsb-load-more-btn",
    "[data-acsb-load-older-control='true']",
].join(",");

export function isLoadOlderControlNode(element: Element): boolean {
    return element.matches?.(LOAD_OLDER_CONTROL_SELECTOR) === true
        || element.closest?.(LOAD_OLDER_CONTROL_SELECTOR) !== null;
}

export function getLoadOlderControlSelectorForTests(): string {
    return LOAD_OLDER_CONTROL_SELECTOR;
}
