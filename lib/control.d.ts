import type { KnowledgeConnectionSettings } from './connection.js';
import type { RuntimeContextLike } from './runtime.js';
export declare const KNOWLEDGE_CONTROL_PATH = "/ltx-jc-rag-control/v1/connection";
export interface KnowledgeConnectionView {
    backend: 'local' | 'remote';
    remoteUrl?: string;
    remoteTimeoutMs: number;
    tokenConfigured: boolean;
    autoMountDefaultKnowledgeBase: boolean;
    canSwitchRemote: boolean;
    writable: boolean;
    managementAvailable: boolean;
    managementPath?: string;
}
export interface KnowledgeConnectionUpdate {
    backend: 'local' | 'remote';
    remoteUrl?: string;
    remoteToken?: string;
    remoteTimeoutMs: number;
    autoMountDefaultKnowledgeBase?: boolean;
}
export interface KnowledgeControlOptions {
    current(): KnowledgeConnectionSettings;
    canSwitchRemote: boolean | (() => boolean);
    writable: boolean;
    managementAvailable: boolean | (() => boolean);
    managementPath?: string;
    autoMountDefaultKnowledgeBase?: boolean | (() => boolean);
    update(value: KnowledgeConnectionUpdate): Promise<KnowledgeConnectionSettings>;
    updateAutoMountDefaultKnowledgeBase?(enabled: boolean): Promise<void>;
}
/** Register the same-origin control surface used by the plugin settings card. */
export declare function registerKnowledgeControl(ctx: RuntimeContextLike, options: KnowledgeControlOptions): () => void;
//# sourceMappingURL=control.d.ts.map