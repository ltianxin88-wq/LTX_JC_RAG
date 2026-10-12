import type { ResolvedConfig } from './config.js';
import type { KnowledgeProvider } from './provider.js';
import { type RuntimeContextLike, type SessionLike } from './runtime.js';
export declare class ExtractionCoordinator {
    private readonly ctx;
    private readonly provider;
    private readonly config;
    private readonly clientRoute;
    private closing;
    private readonly shutdown;
    constructor(ctx: RuntimeContextLike, provider: KnowledgeProvider, config: ResolvedConfig, clientRoute?: () => {
        provider: string;
        model: string;
    } | undefined);
    run(session: SessionLike, turn: number, parentSignal: AbortSignal): Promise<ExtractionResult>;
    close(): Promise<void>;
    private process;
}
export interface ExtractionResult {
    status: 'completed' | 'skipped' | 'unmounted' | 'duplicate';
    candidateCount: number;
    directCount: number;
    auditCount: number;
    bases: Array<{
        knowledgeBaseId: string;
        name: string;
        directCount: number;
        auditCount: number;
    }>;
}
//# sourceMappingURL=extraction.d.ts.map