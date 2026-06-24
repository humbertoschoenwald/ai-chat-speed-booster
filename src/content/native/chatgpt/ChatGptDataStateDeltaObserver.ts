import { CHATGPT_TURN_SELECTOR } from "./ChatGptSelectors";

export interface ChatGptDataStateDeltaSnapshot {
    readonly rootPresent: boolean;
    readonly openStateCount: number;
    readonly changedElementCount: number;
}

type DataStateMutationObserver = Pick<MutationObserver, "observe" | "disconnect">;
type DataStateMutationObserverCtor = new (callback: MutationCallback) => DataStateMutationObserver;

const DATA_STATE_SELECTOR = "[data-state],[aria-expanded]";

export function countOpenChatGptDataStateElements(root: HTMLElement): number {
    let count = isOpenState(root) ? 1 : 0;
    root.querySelectorAll<HTMLElement>(DATA_STATE_SELECTOR).forEach((element) => {
        if (isOpenState(element)) count += 1;
    });
    return count;
}

export class ChatGptDataStateDeltaObserver {
    private readonly observerCtor: DataStateMutationObserverCtor;
    private observer: DataStateMutationObserver | null = null;
    private root: HTMLElement | null = null;
    private readonly openElements = new Set<HTMLElement>();
    private readonly changedElements = new Set<HTMLElement>();

    constructor(observerCtor: DataStateMutationObserverCtor = MutationObserver) {
        this.observerCtor = observerCtor;
    }

    setRoot(root: HTMLElement | null): void {
        if (this.root === root) return;
        this.disconnect();
        this.root = root;
        if (!root) return;
        this.scan(root);
        this.observer = new this.observerCtor(this.handleMutations);
        this.observer.observe(root, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ["data-state", "aria-expanded"],
            subtree: true,
        });
    }

    disconnect(): void {
        this.observer?.disconnect();
        this.observer = null;
        this.root = null;
        this.openElements.clear();
        this.changedElements.clear();
    }

    snapshot(): ChatGptDataStateDeltaSnapshot {
        return {
            rootPresent: this.root !== null,
            openStateCount: this.openElements.size,
            changedElementCount: this.changedElements.size,
        };
    }

    consumeChangedTurns(): HTMLElement[] {
        const turns = new Set<HTMLElement>();
        for (const element of this.changedElements) {
            const turn = element.closest<HTMLElement>(CHATGPT_TURN_SELECTOR);
            if (turn) turns.add(turn);
        }
        this.changedElements.clear();
        return [...turns];
    }

    private scan(root: HTMLElement): void {
        this.openElements.clear();
        this.changedElements.clear();
        if (isOpenState(root)) this.openElements.add(root);
        root.querySelectorAll<HTMLElement>(DATA_STATE_SELECTOR).forEach((element) => {
            if (isOpenState(element)) this.openElements.add(element);
        });
    }

    private readonly handleMutations: MutationCallback = (mutations) => {
        for (const mutation of mutations) {
            if (!(mutation.target instanceof HTMLElement)) continue;
            const element = mutation.target;
            const wasOpen = this.openElements.has(element);
            const isOpen = isOpenState(element);
            if (wasOpen === isOpen) continue;
            if (isOpen) {
                this.openElements.add(element);
            } else {
                this.openElements.delete(element);
            }
            this.changedElements.add(element);
        }
    };
}

function isOpenState(element: HTMLElement): boolean {
    return element.getAttribute("data-state") === "open"
        || element.getAttribute("aria-expanded") === "true";
}
