import type { KnowledgeProvider } from './provider.js';
import { KnowledgeNoteHandleCodec } from './note-reference-handle.js';
import type { RuntimeContextLike } from './runtime.js';
/** AI-facing note workspace operations. Every mutation requires a direct user request and signed session handles. */
export declare function registerKnowledgeNoteTools(ctx: RuntimeContextLike, provider: KnowledgeProvider, codec: KnowledgeNoteHandleCodec): void;
//# sourceMappingURL=note-tools.d.ts.map