import type { IncomingMessage } from 'node:http';
import { LocalKnowledgeProvider } from './local-provider.js';
import type { RuntimeContextLike } from './runtime.js';
export declare const LOCAL_MANAGEMENT_API_PREFIX = "/ltx-jc-rag-local/v1";
export interface KnowledgeApiOptions {
    authMode?: 'bearer' | 'same-origin';
    service?: {
        current(): {
            publicApiEnabled: boolean;
            publicApiPrefix: string;
            writebackProvider?: string;
            writebackModel?: string;
        };
        update(patch: {
            publicApiEnabled?: boolean;
            writebackProvider?: string | null;
            writebackModel?: string | null;
        }): Promise<{
            publicApiEnabled: boolean;
            publicApiPrefix: string;
            writebackProvider?: string;
            writebackModel?: string;
        }>;
    };
}
export declare function registerKnowledgeApi(ctx: RuntimeContextLike, provider: LocalKnowledgeProvider, prefix: string, options?: KnowledgeApiOptions): () => void;
export declare function assertKnowledgeBrowserRequest(req: IncomingMessage, client: 'management-web' | 'conversation-web'): void;
//# sourceMappingURL=api.d.ts.map