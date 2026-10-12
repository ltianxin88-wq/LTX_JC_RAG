export declare const KNOWLEDGE_THEME_MESSAGE = "ltx-jc-rag/host-theme";
export declare const KNOWLEDGE_THEME_READY_MESSAGE = "ltx-jc-rag/host-theme-ready";
export declare const KNOWLEDGE_THEME_PROTOCOL_VERSION = 1;
export type KnowledgeColorScheme = 'light' | 'dark';
export interface KnowledgeHostThemeMessage {
    type: typeof KNOWLEDGE_THEME_MESSAGE;
    version: typeof KNOWLEDGE_THEME_PROTOCOL_VERSION;
    colorScheme: KnowledgeColorScheme;
    tokens: Record<string, string>;
}
export interface ThemeSnapshotLike {
    active: {
        colorScheme: KnowledgeColorScheme;
        tokens: Readonly<Record<string, string>>;
    };
}
interface ComputedStyleLike {
    getPropertyValue(name: string): string;
}
/** Synchronise host light/dark mode while preserving one coherent workspace palette. */
export declare function createKnowledgeHostTheme(_computed: ComputedStyleLike, snapshot: ThemeSnapshotLike): KnowledgeHostThemeMessage;
export {};
//# sourceMappingURL=theme-bridge.d.ts.map