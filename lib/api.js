import { DEFAULT_KNOWLEDGE_BASE_ID, isKnowledgeType, normalizeDraft, normalizeKnowledgeBaseDraft, normalizeKnowledgeMountDraft, } from './domain.js';
const MAX_BODY_BYTES = 1_048_576;
const MAX_IMPORT_BODY_BYTES = 20 * 1024 * 1024;
const MAX_IMPORT_FILE_BYTES = 15 * 1024 * 1024;
const MAX_IMPORT_FILES = 50;
const MAX_IMPORT_ITEMS = 500;
const MAX_IMPORT_TEXT_CHARS = 49_000;
const MAX_NOTE_BODY_BYTES = 64 * 1024 * 1024;
export const LOCAL_MANAGEMENT_API_PREFIX = '/ltx-jc-rag-local/v1';
export function registerKnowledgeApi(ctx, provider, prefix, options = {}) {
    const webServer = ctx.webServer ?? ctx.get('webServer');
    if (webServer === undefined)
        throw new Error('exposeApi requires the DSH webServer service');
    return webServer.register({
        kind: 'prefix',
        path: prefix,
        handler: async (req, res) => {
            try {
                await dispatch(provider, prefix, options, req, res);
            }
            catch (error) {
                sendError(res, error);
            }
        },
    });
}
async function dispatch(provider, prefix, options, req, res) {
    const url = new URL(req.url ?? '/', 'http://knowledge.local');
    const relative = url.pathname.slice(prefix.length).replace(/^\/+|\/+$/g, '');
    let segments;
    try {
        segments = relative.length === 0 ? [] : relative.split('/').map(decodeURIComponent);
    }
    catch {
        throw httpError(400, 'knowledge API path contains invalid encoding');
    }
    const method = req.method ?? 'GET';
    if (method === 'GET' && segments[0] === 'health') {
        return sendJson(res, 200, { ok: true, service: 'ltx-jc-rag', schemaVersion: 11 });
    }
    const actor = options.authMode === 'same-origin' ? authenticateSameOrigin(req) : authenticateBearer(provider, req);
    if (segments[0] === 'notes') {
        if (method === 'GET' && segments.length === 1) {
            requirePermission(actor.permissions, 'read');
            const query = url.searchParams.get('q');
            const parentId = url.searchParams.get('parentId');
            return sendJson(res, 200, provider.notes.list({
                ...query === null ? {} : { query },
                ...query === null ? { parentId } : {},
                limit: integerParam(url, 'limit', 200, 1, 500),
            }));
        }
        if (method === 'POST' && segments[1] === 'folders' && segments.length === 2) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            return sendJson(res, 201, await provider.notes.createFolder(requiredString(body.name, 'name'), nullableString(body.parentId, 'parentId')));
        }
        if (method === 'POST' && segments[1] === 'documents' && segments.length === 2) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            return sendJson(res, 201, await provider.notes.createDocument(requiredString(body.name, 'name'), nullableString(body.parentId, 'parentId'), typeof body.content === 'string' ? body.content : ''));
        }
        if (method === 'POST' && segments[1] === 'files' && segments.length === 2) {
            requirePermission(actor.permissions, 'write');
            const name = url.searchParams.get('name') ?? '';
            const parentId = url.searchParams.get('parentId');
            const mediaType = firstHeader(req.headers['content-type']) ?? 'application/octet-stream';
            const content = await readBinary(req, MAX_NOTE_BODY_BYTES);
            return sendJson(res, 201, await provider.notes.upload({ name, parentId, mediaType, content }));
        }
        const id = segments[1];
        if (id !== undefined && method === 'GET' && segments.length === 2) {
            requirePermission(actor.permissions, 'read');
            const node = provider.notes.get(id);
            if (node === undefined)
                throw httpError(404, `note node "${id}" was not found`);
            return sendJson(res, 200, node);
        }
        if (id !== undefined && method === 'GET' && segments[2] === 'content' && segments.length === 3) {
            requirePermission(actor.permissions, 'read');
            const note = await provider.notes.read(id);
            return sendOpaqueFile(res, note.node.name, note.node.mediaType ?? 'application/octet-stream', note.content, url.searchParams.get('download') === '1');
        }
        if (id !== undefined && method === 'PUT' && segments[2] === 'content' && segments.length === 3) {
            requirePermission(actor.permissions, 'write');
            return sendJson(res, 200, await provider.notes.updateContent(id, await readBinary(req, MAX_NOTE_BODY_BYTES)));
        }
        if (id !== undefined && method === 'GET' && segments[2] === 'references' && segments.length === 3) {
            requirePermission(actor.permissions, 'read');
            return sendJson(res, 200, await noteReferencesForSubtree(provider, id));
        }
        if (id !== undefined && method === 'PATCH' && segments.length === 2) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            let node = provider.notes.get(id);
            if (node === undefined)
                throw httpError(404, `note node "${id}" was not found`);
            if (Object.hasOwn(body, 'name'))
                node = provider.notes.rename(id, requiredString(body.name, 'name'));
            if (Object.hasOwn(body, 'parentId'))
                node = provider.notes.move(id, nullableString(body.parentId, 'parentId'));
            return sendJson(res, 200, node);
        }
        if (id !== undefined && method === 'POST' && segments[2] === 'copy' && segments.length === 3) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            return sendJson(res, 201, await provider.notes.copy(id, Object.hasOwn(body, 'parentId') ? nullableString(body.parentId, 'parentId') : undefined, Object.hasOwn(body, 'name') ? requiredString(body.name, 'name') : undefined));
        }
        if (id !== undefined && method === 'DELETE' && segments.length === 2) {
            requirePermission(actor.permissions, 'admin');
            const noteIds = provider.notes.subtree(id).filter(node => node.kind !== 'folder').map(node => node.id);
            const references = await noteReferencesForSubtree(provider, id);
            if (references.length > 0 && url.searchParams.get('force') !== 'true') {
                throw httpError(409, `note content is referenced by ${references.length} knowledge document(s)`);
            }
            await provider.notes.delete(id);
            provider.deleteNoteReferences(noteIds);
            return sendJson(res, 204, undefined);
        }
    }
    if (segments[0] === 'settings' && segments.length === 1) {
        requirePermission(actor.permissions, 'read');
        if (method === 'GET')
            return sendJson(res, 200, await provider.getSettings());
        if (method === 'PUT') {
            requirePermission(actor.permissions, 'admin');
            const body = await readObject(req);
            if (!isRecord(body.patch))
                throw httpError(400, 'knowledge settings patch is invalid');
            const writebackPolicy = body.patch.writebackPolicy;
            if (writebackPolicy !== undefined && writebackPolicy !== 'conservative' && writebackPolicy !== 'proactive')
                throw httpError(400, 'writebackPolicy must be conservative or proactive');
            return sendJson(res, 200, await provider.updateSettings({
                ...writebackPolicy === undefined ? {} : { writebackPolicy },
            }));
        }
    }
    if (segments[0] === 'service' && segments.length === 1 && options.service !== undefined) {
        requirePermission(actor.permissions, 'admin');
        if (method === 'GET')
            return sendJson(res, 200, options.service.current());
        if (method === 'PUT') {
            const body = await readObject(req);
            if (body.publicApiEnabled !== undefined && typeof body.publicApiEnabled !== 'boolean')
                throw httpError(400, 'publicApiEnabled must be a boolean');
            const writebackProvider = body.writebackProvider;
            const writebackModel = body.writebackModel;
            if (writebackProvider !== undefined && writebackProvider !== null && typeof writebackProvider !== 'string')
                throw httpError(400, 'writebackProvider must be a string or null');
            if (writebackModel !== undefined && writebackModel !== null && typeof writebackModel !== 'string')
                throw httpError(400, 'writebackModel must be a string or null');
            return sendJson(res, 200, await options.service.update({
                ...body.publicApiEnabled === undefined ? {} : { publicApiEnabled: body.publicApiEnabled },
                ...writebackProvider === undefined ? {} : { writebackProvider },
                ...writebackModel === undefined ? {} : { writebackModel },
            }));
        }
    }
    if (method === 'GET' && segments[0] === 'search' && segments.length === 1) {
        requirePermission(actor.permissions, 'read');
        const types = url.searchParams.getAll('type').filter(isKnowledgeType);
        const projectId = url.searchParams.get('projectId') ?? undefined;
        const knowledgeBaseIds = url.searchParams.getAll('knowledgeBaseId').filter(Boolean);
        const includeTags = url.searchParams.getAll('includeTag').filter(Boolean);
        const excludeTags = url.searchParams.getAll('excludeTag').filter(Boolean);
        const result = await provider.search({
            text: url.searchParams.get('q') ?? '',
            ...projectId === undefined ? {} : { projectId },
            ...knowledgeBaseIds.length === 0 ? {} : { knowledgeBaseIds },
            ...includeTags.length === 0 ? {} : { includeTags },
            ...excludeTags.length === 0 ? {} : { excludeTags },
            ...types.length === 0 ? {} : { types },
            limit: integerParam(url, 'limit', 10, 1, 100),
        });
        return sendJson(res, 200, result);
    }
    if (method === 'GET' && segments[0] === 'stats' && segments.length === 1) {
        requirePermission(actor.permissions, 'read');
        return sendJson(res, 200, await provider.stats());
    }
    if (method === 'POST' && segments[0] === 'import' && segments.length === 1) {
        requirePermission(actor.permissions, 'propose');
        const body = await readObject(req, MAX_IMPORT_BODY_BYTES);
        if (body.mode === 'direct')
            requirePermission(actor.permissions, 'write');
        const request = parseImportRequest(body);
        return sendJson(res, 200, await importKnowledge(provider, request));
    }
    if (method === 'GET' && segments[0] === 'document-index' && segments.length === 1) {
        requirePermission(actor.permissions, 'read');
        const query = url.searchParams.get('q') ?? undefined;
        const cursor = url.searchParams.get('cursor') ?? undefined;
        const requestedBaseIds = url.searchParams.getAll('knowledgeBaseId').map(id => id.trim()).filter(Boolean);
        const sessionId = url.searchParams.get('sessionId')?.trim();
        const knowledgeBaseIds = sessionId
            ? (await provider.resolveMounts(sessionId, url.searchParams.get('projectId') ?? undefined)).map(mount => mount.knowledgeBaseId)
            : requestedBaseIds.length > 0 ? requestedBaseIds : undefined;
        return sendJson(res, 200, await provider.listDocumentIndex({
            ...knowledgeBaseIds === undefined ? {} : { knowledgeBaseIds },
            activeKnowledgeBasesOnly: url.searchParams.get('active') === '1',
            ...query === undefined ? {} : { query },
            ...cursor === undefined ? {} : { cursor },
            limit: integerParam(url, 'limit', 60, 1, 100),
        }));
    }
    if (segments[0] === 'knowledge-bases') {
        if (method === 'GET' && segments.length === 1) {
            requirePermission(actor.permissions, 'read');
            return sendJson(res, 200, await provider.listKnowledgeBases());
        }
        if (method === 'POST' && segments.length === 1) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            return sendJson(res, 201, await provider.createKnowledgeBase(parseKnowledgeBaseDraft(body.draft)));
        }
        const id = segments[1];
        if (id !== undefined && method === 'GET' && segments.length === 2) {
            requirePermission(actor.permissions, 'read');
            const base = await provider.getKnowledgeBase(id);
            if (base === undefined)
                throw httpError(404, `knowledge base "${id}" was not found`);
            return sendJson(res, 200, base);
        }
        if (id !== undefined && method === 'PUT' && segments.length === 2) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            return sendJson(res, 200, await provider.updateKnowledgeBase(id, parseKnowledgeBaseDraft(body.draft)));
        }
        if (id !== undefined && method === 'PATCH' && segments.length === 2) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            return sendJson(res, 200, await provider.patchKnowledgeBase(id, parseKnowledgeBasePatch(body.patch)));
        }
        if (id !== undefined && method === 'POST' && segments[2] === 'archive' && segments.length === 3) {
            requirePermission(actor.permissions, 'admin');
            return sendJson(res, 200, await provider.archiveKnowledgeBase(id));
        }
        if (id !== undefined && method === 'POST' && segments[2] === 'restore' && segments.length === 3) {
            requirePermission(actor.permissions, 'admin');
            return sendJson(res, 200, await provider.restoreKnowledgeBase(id));
        }
        if (id !== undefined && method === 'DELETE' && segments.length === 2) {
            requirePermission(actor.permissions, 'admin');
            await provider.deleteKnowledgeBase(id);
            return sendJson(res, 204, undefined);
        }
    }
    if (segments[0] === 'mounts') {
        if (method === 'GET' && segments[1] === 'resolve' && segments.length === 2) {
            requirePermission(actor.permissions, 'read');
            const sessionId = url.searchParams.get('sessionId')?.trim();
            if (!sessionId)
                throw httpError(400, 'sessionId is required');
            return sendJson(res, 200, await provider.resolveMounts(sessionId, url.searchParams.get('projectId') ?? undefined));
        }
        if (method === 'GET' && segments.length === 1) {
            requirePermission(actor.permissions, 'read');
            const targetKind = url.searchParams.get('targetKind');
            if (targetKind !== null && targetKind !== 'project' && targetKind !== 'session')
                throw httpError(400, 'invalid mount targetKind');
            return sendJson(res, 200, await provider.listMounts(targetKind ?? undefined, url.searchParams.get('targetId') ?? undefined));
        }
        if (method === 'POST' && segments.length === 1) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            return sendJson(res, 200, await provider.upsertMount(parseMountDraft(body.draft)));
        }
        if (method === 'POST' && segments[1] === 'bulk' && segments.length === 2) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            const upserts = Array.isArray(body.upserts) ? body.upserts.map(parseMountDraft) : [];
            const deleteIds = Array.isArray(body.deleteIds)
                ? body.deleteIds.map(id => typeof id === 'string' ? id.trim() : '').filter(Boolean)
                : [];
            if (upserts.length + deleteIds.length === 0)
                throw httpError(400, 'mount batch must contain at least one operation');
            if (upserts.length + deleteIds.length > 500)
                throw httpError(400, 'mount batch must contain at most 500 operations');
            return sendJson(res, 200, await provider.applyMountBatch({ upserts, deleteIds }));
        }
        if (method === 'DELETE' && segments[1] !== undefined && segments.length === 2) {
            requirePermission(actor.permissions, 'write');
            await provider.deleteMount(segments[1]);
            return sendJson(res, 204, undefined);
        }
    }
    if (segments[0] === 'documents') {
        if (method === 'GET' && segments.length === 1) {
            requirePermission(actor.permissions, 'read');
            return sendJson(res, 200, await provider.listDocuments(url.searchParams.get('knowledgeBaseId') ?? undefined, url.searchParams.get('q') ?? undefined));
        }
        if (method === 'GET' && segments[1] !== undefined && segments.length === 2) {
            requirePermission(actor.permissions, 'read');
            const document = await provider.getDocument(segments[1]);
            if (document === undefined)
                throw httpError(404, `knowledge document "${segments[1]}" was not found`);
            return sendJson(res, 200, document);
        }
        if (method === 'POST' && segments[1] !== undefined && segments[2] === 'finalize' && segments.length === 3) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            if (body.state !== 'resolved' && body.state !== 'complete') {
                throw httpError(400, 'document finalization state must be resolved or complete');
            }
            const note = optionalString(body.note);
            return sendJson(res, 200, await provider.finalize(segments[1], body.state, note));
        }
        if (method === 'POST' && segments[1] !== undefined && segments[2] === 'reopen' && segments.length === 3) {
            requirePermission(actor.permissions, 'write');
            return sendJson(res, 200, await provider.reopen(segments[1]));
        }
    }
    if (segments[0] === 'entries') {
        if (method === 'GET' && segments.length === 1) {
            requirePermission(actor.permissions, 'read');
            const status = url.searchParams.get('status');
            const type = url.searchParams.get('type');
            const projectId = url.searchParams.get('projectId') ?? undefined;
            const knowledgeBaseId = url.searchParams.get('knowledgeBaseId') ?? undefined;
            const cursor = url.searchParams.get('cursor') ?? undefined;
            const result = await provider.list({
                ...status === 'active' || status === 'archived' ? { status } : {},
                ...type !== null && isKnowledgeType(type) ? { type } : {},
                ...projectId === undefined ? {} : { projectId },
                ...knowledgeBaseId === undefined ? {} : { knowledgeBaseId },
                ...cursor === undefined ? {} : { cursor },
                limit: integerParam(url, 'limit', 50, 1, 100),
            });
            return sendJson(res, 200, result);
        }
        if (method === 'POST' && segments.length === 1) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            return sendJson(res, 201, await provider.create(parseDraft(body.draft)));
        }
        const id = segments[1];
        if (id !== undefined && method === 'GET' && segments.length === 2) {
            requirePermission(actor.permissions, 'read');
            const entry = await provider.get(id);
            if (entry === undefined)
                throw httpError(404, `knowledge entry "${id}" was not found`);
            return sendJson(res, 200, entry);
        }
        if (id !== undefined && method === 'GET' && segments[2] === 'versions' && segments.length === 3) {
            requirePermission(actor.permissions, 'read');
            return sendJson(res, 200, await provider.versions(id));
        }
        if (id !== undefined && method === 'GET' && segments[2] === 'note-references' && segments.length === 3) {
            requirePermission(actor.permissions, 'read');
            return sendJson(res, 200, await provider.listKnowledgeNoteReferences(id));
        }
        if (id !== undefined && method === 'POST' && segments[2] === 'note-references' && segments.length === 3) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            const source = body.source === 'agent' ? 'agent' : 'user';
            const sourceSessionId = source === 'agent' ? optionalString(body.sourceSessionId) : undefined;
            return sendJson(res, 201, await provider.addKnowledgeNoteReference(id, requiredString(body.noteId, 'noteId'), source, sourceSessionId));
        }
        if (id !== undefined && method === 'DELETE' && segments[2] === 'note-references' && segments[3] !== undefined && segments.length === 4) {
            requirePermission(actor.permissions, 'write');
            await provider.deleteKnowledgeNoteReference(id, segments[3]);
            return sendJson(res, 204, undefined);
        }
        if (id !== undefined && method === 'PUT' && segments.length === 2) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            return sendJson(res, 200, await provider.update(id, parseDraft(body.draft)));
        }
        if (id !== undefined && method === 'POST' && segments[2] === 'archive' && segments.length === 3) {
            requirePermission(actor.permissions, 'write');
            return sendJson(res, 200, await provider.archive(id));
        }
        if (id !== undefined && method === 'DELETE' && segments.length === 2) {
            requirePermission(actor.permissions, 'admin');
            await provider.delete(id);
            return sendJson(res, 204, undefined);
        }
    }
    if (segments[0] === 'candidates') {
        if (method === 'GET' && segments.length === 1) {
            requirePermission(actor.permissions, 'read');
            const status = url.searchParams.get('status');
            if (status !== 'pending' && status !== 'approved' && status !== 'rejected')
                throw httpError(400, 'invalid candidate status');
            return sendJson(res, 200, await provider.listCandidates(status, integerParam(url, 'limit', 50, 1, 100)));
        }
        if (method === 'POST' && segments.length === 1) {
            requirePermission(actor.permissions, 'propose');
            const body = await readObject(req);
            return sendJson(res, 201, await provider.propose(parseProposal(body.proposal), optionalString(body.sourceKey)));
        }
        if (method === 'POST' && segments[1] === 'direct' && segments.length === 2) {
            requirePermission(actor.permissions, 'propose');
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            return sendJson(res, 200, await provider.writeDirect(parseProposal(body.proposal), optionalString(body.sourceKey)));
        }
        if (method === 'POST' && segments[1] !== undefined && segments[2] === 'review' && segments.length === 3) {
            requirePermission(actor.permissions, 'write');
            const body = await readObject(req);
            return sendJson(res, 200, await provider.review(segments[1], parseReview(body)));
        }
    }
    if (segments[0] === 'extraction-jobs' && segments[1] !== undefined) {
        const sourceKey = segments[1];
        if (method === 'GET' && segments.length === 2) {
            requirePermission(actor.permissions, 'read');
            const job = await provider.extractionJob(sourceKey);
            if (job === undefined)
                throw httpError(404, 'extraction job was not found');
            return sendJson(res, 200, job);
        }
        requirePermission(actor.permissions, 'propose');
        if (method === 'POST' && segments[2] === 'claim') {
            return sendJson(res, 200, { claimed: await provider.claimExtraction(sourceKey) });
        }
        if (method === 'POST' && segments[2] === 'complete') {
            const body = await readObject(req);
            const count = typeof body.candidateCount === 'number' && Number.isInteger(body.candidateCount) ? body.candidateCount : 0;
            await provider.completeExtraction(sourceKey, Math.max(0, count));
            return sendJson(res, 204, undefined);
        }
        if (method === 'POST' && segments[2] === 'fail') {
            const body = await readObject(req);
            await provider.failExtraction(sourceKey, typeof body.error === 'string' ? body.error : 'remote extraction failed');
            return sendJson(res, 204, undefined);
        }
        if (method === 'POST' && segments[2] === 'reset') {
            await provider.resetExtraction(sourceKey);
            return sendJson(res, 204, undefined);
        }
    }
    if (segments[0] === 'tokens') {
        requirePermission(actor.permissions, 'admin');
        if (method === 'GET' && segments.length === 1)
            return sendJson(res, 200, provider.listApiTokens());
        if (method === 'POST' && segments.length === 1) {
            const body = await readObject(req);
            const name = typeof body.name === 'string' ? body.name : '';
            const permissions = Array.isArray(body.permissions)
                ? body.permissions.filter((permission) => permission === 'read' || permission === 'propose' || permission === 'write' || permission === 'admin')
                : [];
            return sendJson(res, 201, provider.createApiToken(name, permissions));
        }
        if (method === 'DELETE' && segments[1] !== undefined && segments.length === 2) {
            if (segments[1] === actor.id)
                throw httpError(409, 'the current token cannot revoke itself');
            const token = provider.listApiTokens().find(item => item.id === segments[1]);
            if (token === undefined)
                throw httpError(404, 'API token was not found');
            if (token.revokedAt === undefined)
                provider.revokeApiToken(segments[1]);
            else
                provider.deleteApiToken(segments[1]);
            return sendJson(res, 204, undefined);
        }
    }
    throw httpError(404, 'knowledge API route was not found');
}
async function importKnowledge(provider, request) {
    const batchId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const items = [];
    let planned = 0;
    for (const file of request.files) {
        try {
            const drafts = importPlansForFile(file, request);
            for (const plan of drafts) {
                if ('status' in plan) {
                    items.push(plan);
                    continue;
                }
                planned += 1;
                if (planned > MAX_IMPORT_ITEMS)
                    throw httpError(400, `import can create at most ${MAX_IMPORT_ITEMS} knowledge items`);
                try {
                    const proposal = {
                        action: 'create',
                        draft: plan.draft,
                        reason: `Imported from ${plan.file}; review before accepting into the knowledge base.`,
                    };
                    const sourceKey = `ltx-jc-rag-import:${batchId}:${planned}`;
                    if (request.mode === 'audit') {
                        const candidate = await provider.propose(proposal, sourceKey);
                        items.push({ file: plan.file, title: plan.title, status: 'candidate', id: candidate.id });
                    }
                    else {
                        const result = await provider.writeDirect(proposal, sourceKey);
                        if (result.outcome === 'duplicate') {
                            const id = result.entry?.id ?? result.candidate?.id;
                            items.push({ file: plan.file, title: plan.title, status: 'duplicate', ...id === undefined ? {} : { id }, outcome: result.outcome });
                        }
                        else if (result.entry !== undefined) {
                            items.push({ file: plan.file, title: plan.title, status: 'entry', id: result.entry.id, outcome: result.outcome });
                        }
                        else if (result.candidate !== undefined) {
                            items.push({ file: plan.file, title: plan.title, status: 'candidate', id: result.candidate.id, outcome: result.outcome });
                        }
                        else {
                            items.push({ file: plan.file, title: plan.title, status: 'failed', outcome: result.outcome, error: `direct import returned ${result.outcome}` });
                        }
                    }
                }
                catch (error) {
                    items.push({ file: plan.file, title: plan.title, status: 'failed', error: friendlyImportError(error) });
                }
            }
        }
        catch (error) {
            items.push({ file: file.name, status: 'failed', error: friendlyImportError(error) });
        }
    }
    const candidates = items.filter(item => item.status === 'candidate').length;
    const entries = items.filter(item => item.status === 'entry').length;
    const duplicates = items.filter(item => item.status === 'duplicate').length;
    const failed = items.filter(item => item.status === 'failed').length;
    return {
        mode: request.mode,
        imported: candidates + entries + duplicates,
        failed,
        candidates,
        entries,
        duplicates,
        items,
    };
}
function parseImportRequest(value) {
    const mode = value.mode === 'direct' ? 'direct' : 'audit';
    const knowledgeBaseId = optionalString(value.knowledgeBaseId) ?? DEFAULT_KNOWLEDGE_BASE_ID;
    const type = isKnowledgeType(value.type) ? value.type : 'fact';
    const tags = parseImportTags(value.tags);
    const scope = parseImportScope(value.scope);
    if (!Array.isArray(value.files))
        throw httpError(400, 'import files must be an array');
    if (value.files.length === 0)
        throw httpError(400, 'import requires at least one file');
    if (value.files.length > MAX_IMPORT_FILES)
        throw httpError(400, `import supports at most ${MAX_IMPORT_FILES} files per batch`);
    const files = value.files.map((file, index) => {
        if (!isRecord(file))
            throw httpError(400, `import file ${index + 1} is invalid`);
        if (typeof file.content !== 'string')
            throw httpError(400, `import file ${index + 1} content must be a string`);
        const name = typeof file.name === 'string' && file.name.trim() ? file.name.trim() : `import-${index + 1}.txt`;
        const mediaType = typeof file.mediaType === 'string' && file.mediaType.trim() ? file.mediaType.trim() : undefined;
        return { name, content: file.content, ...mediaType === undefined ? {} : { mediaType } };
    });
    return { mode, knowledgeBaseId, type, tags, scope, files };
}
function parseImportScope(value) {
    if (!isRecord(value))
        return { kind: 'global' };
    if (value.kind === 'project')
        return { kind: 'project', id: typeof value.id === 'string' ? value.id : '' };
    return { kind: 'global' };
}
function importPlansForFile(file, request) {
    if (Buffer.byteLength(file.content, 'utf8') > MAX_IMPORT_FILE_BYTES) {
        throw httpError(413, `file "${file.name}" exceeds the 15 MiB import limit`);
    }
    const extension = fileExtension(file.name);
    if (extension === 'json')
        return jsonImportPlans(file, request);
    if (extension === 'jsonl' || extension === 'ndjson')
        return jsonlImportPlans(file, request);
    if (extension === 'csv')
        return csvImportPlans(file, request);
    if (extension === 'md' || extension === 'markdown' || extension === 'txt' || isPlainTextMediaType(file.mediaType)) {
        return textImportPlans(file, request);
    }
    throw httpError(400, `unsupported import file type "${extension || file.mediaType || 'unknown'}"`);
}
function textImportPlans(file, request) {
    const title = baseTitle(file.name);
    const chunks = splitImportText(stripBom(file.content), MAX_IMPORT_TEXT_CHARS);
    if (chunks.length === 1)
        return [draftPlan(file.name, title, chunks[0] ?? '', {}, request)];
    return chunks.map((chunk, index) => draftPlan(file.name, `${title} (${index + 1}/${chunks.length})`, chunk, {}, request));
}
function jsonImportPlans(file, request) {
    const parsed = JSON.parse(stripBom(file.content));
    const values = Array.isArray(parsed) ? parsed : [parsed];
    if (values.length === 0)
        throw httpError(400, 'JSON import array is empty');
    return values.map((value, index) => {
        try {
            return draftPlanFromRecord(file.name, index, value, request);
        }
        catch (error) {
            return { file: file.name, status: 'failed', error: friendlyImportError(error) };
        }
    });
}
function jsonlImportPlans(file, request) {
    const lines = stripBom(file.content).split(/\r?\n/u);
    const plans = [];
    for (const [index, line] of lines.entries()) {
        if (!line.trim())
            continue;
        const rowName = `${file.name}:${index + 1}`;
        try {
            plans.push(draftPlanFromRecord(rowName, index, JSON.parse(line), request));
        }
        catch (error) {
            plans.push({ file: rowName, status: 'failed', error: friendlyImportError(error) });
        }
    }
    if (plans.length === 0)
        throw httpError(400, 'JSONL import file has no records');
    return plans;
}
function csvImportPlans(file, request) {
    const rows = parseCsv(stripBom(file.content));
    if (rows.length < 2)
        throw httpError(400, 'CSV import requires a header row and at least one data row');
    const headers = (rows[0] ?? []).map(header => header.trim());
    const plans = [];
    for (let index = 1; index < rows.length; index += 1) {
        const row = rows[index] ?? [];
        if (row.every(cell => !cell.trim()))
            continue;
        const record = {};
        for (const [column, header] of headers.entries()) {
            if (!header)
                continue;
            record[header] = row[column] ?? '';
        }
        const rowName = `${file.name}:${index + 1}`;
        try {
            plans.push(draftPlanFromRecord(rowName, index - 1, record, request, true));
        }
        catch (error) {
            plans.push({ file: rowName, status: 'failed', error: friendlyImportError(error) });
        }
    }
    if (plans.length === 0)
        throw httpError(400, 'CSV import file has no data rows');
    return plans;
}
function draftPlanFromRecord(fileName, index, value, request, renderMissingBody = false) {
    if (!isRecord(value))
        throw httpError(400, 'import record must be an object');
    const title = stringMember(value, ['title', 'name']) || `${baseTitle(fileName)} ${index + 1}`;
    const body = stringMember(value, ['body', 'content', 'text']) || (renderMissingBody ? recordAsText(value) : '');
    if (!body.trim())
        throw httpError(400, 'import record body/content/text is required');
    return draftPlan(fileName, title, body, value, request);
}
function draftPlan(fileName, title, body, source, request) {
    const type = isKnowledgeType(source.type) ? source.type : request.type;
    const draft = normalizeDraft({
        knowledgeBaseId: request.knowledgeBaseId,
        title,
        body,
        type,
        tags: [...request.tags, ...parseImportTags(source.tags)],
        scope: request.scope,
        confidence: typeof source.confidence === 'number' ? source.confidence : 0.8,
        source: { clientId: 'ltx-jc-rag-import', evidence: 'explicit' },
    });
    return { file: fileName, title: draft.title, draft };
}
function parseImportTags(value) {
    if (Array.isArray(value))
        return value.filter((tag) => typeof tag === 'string');
    if (typeof value !== 'string')
        return [];
    return value.split(/[,;，；\n]+/u).map(tag => tag.trim()).filter(Boolean);
}
function stringMember(value, keys) {
    for (const key of keys) {
        const member = value[key];
        if (typeof member === 'string' && member.trim())
            return member;
    }
    return '';
}
function recordAsText(value) {
    return Object.entries(value)
        .filter(([, member]) => member !== undefined && member !== null && String(member).trim().length > 0)
        .map(([key, member]) => `${key}: ${String(member)}`)
        .join('\n');
}
function parseCsv(input) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let index = 0; index < input.length; index += 1) {
        const char = input[index];
        if (quoted) {
            if (char === '"' && input[index + 1] === '"') {
                cell += '"';
                index += 1;
            }
            else if (char === '"')
                quoted = false;
            else
                cell += char;
            continue;
        }
        if (char === '"')
            quoted = true;
        else if (char === ',') {
            row.push(cell);
            cell = '';
        }
        else if (char === '\n') {
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        }
        else if (char !== '\r')
            cell += char;
    }
    row.push(cell);
    if (row.length > 1 || (row[0] ?? '').trim())
        rows.push(row);
    if (quoted)
        throw httpError(400, 'CSV import has an unterminated quoted field');
    return rows;
}
function splitImportText(input, maximumChars) {
    const source = input.trim();
    if (source.length <= maximumChars)
        return [source];
    const chunks = [];
    let current = '';
    const flush = () => {
        const trimmed = current.trim();
        if (trimmed)
            chunks.push(trimmed);
        current = '';
    };
    const appendPiece = (piece) => {
        if (piece.length > maximumChars) {
            flush();
            for (let offset = 0; offset < piece.length; offset += maximumChars) {
                const slice = piece.slice(offset, offset + maximumChars).trim();
                if (slice)
                    chunks.push(slice);
            }
            return;
        }
        if (current.length + piece.length > maximumChars)
            flush();
        current += piece;
    };
    for (const line of source.split(/\n/u))
        appendPiece(`${line}\n`);
    flush();
    return chunks.length ? chunks : [source];
}
function fileExtension(name) {
    const clean = name.split(/[\\/]/u).pop() ?? name;
    const dot = clean.lastIndexOf('.');
    return dot >= 0 ? clean.slice(dot + 1).trim().toLocaleLowerCase() : '';
}
function baseTitle(name) {
    const clean = name.split(/[\\/]/u).pop() ?? name;
    const dot = clean.lastIndexOf('.');
    return (dot > 0 ? clean.slice(0, dot) : clean).trim() || 'Imported knowledge';
}
function stripBom(value) {
    return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}
function isPlainTextMediaType(mediaType) {
    if (mediaType === undefined)
        return false;
    const normalized = (mediaType.split(';')[0] ?? '').trim().toLocaleLowerCase();
    return normalized === 'text/plain' || normalized === 'text/markdown';
}
function friendlyImportError(error) {
    return error instanceof Error ? error.message : 'import failed';
}
function parseKnowledgeBaseDraft(value) {
    if (!isRecord(value))
        throw httpError(400, 'knowledge base draft is invalid');
    try {
        const writebackProvider = optionalNullableStringProperty(value, 'writebackProvider');
        const writebackModel = optionalNullableStringProperty(value, 'writebackModel');
        return normalizeKnowledgeBaseDraft({
            name: typeof value.name === 'string' ? value.name : '',
            description: typeof value.description === 'string' ? value.description : '',
            defaultTags: Array.isArray(value.defaultTags) ? value.defaultTags.filter((tag) => typeof tag === 'string') : [],
            extractionInstructions: typeof value.extractionInstructions === 'string' ? value.extractionInstructions : '',
            writebackPolicy: value.writebackPolicy === 'proactive' ? 'proactive' : 'conservative',
            ...writebackProvider === undefined || writebackProvider === null ? {} : { writebackProvider },
            ...writebackModel === undefined || writebackModel === null ? {} : { writebackModel },
        });
    }
    catch (error) {
        throw httpError(400, error instanceof Error ? error.message : 'knowledge base draft is invalid');
    }
}
function parseKnowledgeBasePatch(value) {
    if (!isRecord(value))
        throw httpError(400, 'knowledge base patch is invalid');
    const patch = {};
    if (Object.hasOwn(value, 'name')) {
        if (typeof value.name !== 'string')
            throw httpError(400, 'knowledge base patch name must be a string');
        patch.name = value.name;
    }
    if (Object.hasOwn(value, 'description')) {
        if (typeof value.description !== 'string')
            throw httpError(400, 'knowledge base patch description must be a string');
        patch.description = value.description;
    }
    if (Object.hasOwn(value, 'defaultTags')) {
        if (!Array.isArray(value.defaultTags) || value.defaultTags.some(tag => typeof tag !== 'string')) {
            throw httpError(400, 'knowledge base patch defaultTags must be a string array');
        }
        patch.defaultTags = value.defaultTags;
    }
    if (Object.hasOwn(value, 'extractionInstructions')) {
        if (typeof value.extractionInstructions !== 'string')
            throw httpError(400, 'knowledge base patch extractionInstructions must be a string');
        patch.extractionInstructions = value.extractionInstructions;
    }
    if (Object.hasOwn(value, 'writebackPolicy')) {
        if (value.writebackPolicy !== 'conservative' && value.writebackPolicy !== 'proactive')
            throw httpError(400, 'knowledge base patch writebackPolicy is invalid');
        patch.writebackPolicy = value.writebackPolicy;
    }
    if (Object.hasOwn(value, 'writebackProvider')) {
        patch.writebackProvider = optionalNullableStringProperty(value, 'writebackProvider');
    }
    if (Object.hasOwn(value, 'writebackModel')) {
        patch.writebackModel = optionalNullableStringProperty(value, 'writebackModel');
    }
    if (Object.keys(patch).length === 0)
        throw httpError(400, 'knowledge base patch must contain at least one editable field');
    return patch;
}
function parseMountDraft(value) {
    if (!isRecord(value))
        throw httpError(400, 'knowledge mount draft is invalid');
    if (value.targetKind !== 'project' && value.targetKind !== 'session') {
        throw httpError(400, 'knowledge mount targetKind must be project or session');
    }
    try {
        return normalizeKnowledgeMountDraft({
            targetKind: value.targetKind,
            targetId: typeof value.targetId === 'string' ? value.targetId : '',
            knowledgeBaseId: typeof value.knowledgeBaseId === 'string' ? value.knowledgeBaseId : '',
            enabled: value.enabled !== false,
            recallEnabled: value.recallEnabled !== false,
            writeMode: value.writeMode === 'direct' || value.writeMode === 'none' ? value.writeMode : 'audit',
            includeTags: Array.isArray(value.includeTags) ? value.includeTags.filter((tag) => typeof tag === 'string') : [],
            excludeTags: Array.isArray(value.excludeTags) ? value.excludeTags.filter((tag) => typeof tag === 'string') : [],
            extractionInstructions: typeof value.extractionInstructions === 'string' ? value.extractionInstructions : '',
        });
    }
    catch (error) {
        throw httpError(400, error instanceof Error ? error.message : 'knowledge mount draft is invalid');
    }
}
function authenticateBearer(provider, req) {
    const authorization = req.headers.authorization;
    if (authorization === undefined || !authorization.startsWith('Bearer '))
        throw httpError(401, 'bearer token is required');
    const actor = provider.authenticate(authorization.slice(7).trim());
    if (actor === undefined)
        throw httpError(401, 'bearer token is invalid or revoked');
    return actor;
}
function authenticateSameOrigin(req) {
    assertKnowledgeBrowserRequest(req, 'management-web');
    return {
        id: 'same-origin-management',
        name: 'DSH management console',
        permissions: ['admin'],
        createdAt: new Date(0).toISOString(),
    };
}
export function assertKnowledgeBrowserRequest(req, client) {
    if (req.headers['x-ltx-jc-rag-client'] !== client) {
        throw httpError(401, 'knowledge client header is required');
    }
    const fetchSite = req.headers['sec-fetch-site'];
    if (fetchSite !== undefined && fetchSite !== 'same-origin' && fetchSite !== 'none') {
        throw httpError(403, 'cross-site knowledge request was rejected');
    }
    const origin = req.headers.origin;
    if (origin !== undefined) {
        let originHost;
        try {
            originHost = new URL(origin).host;
        }
        catch {
            throw httpError(403, 'knowledge request origin is invalid');
        }
        const expectedHost = firstHeader(req.headers['x-forwarded-host']) ?? req.headers.host;
        if (expectedHost === undefined || originHost.toLowerCase() !== expectedHost.toLowerCase()) {
            throw httpError(403, 'cross-origin knowledge request was rejected');
        }
    }
}
function firstHeader(value) {
    const raw = Array.isArray(value) ? value[0] : value;
    return raw?.split(',')[0]?.trim();
}
function requirePermission(permissions, required) {
    if (permissions.includes('admin'))
        return;
    if (required === 'read' && (permissions.includes('write') || permissions.includes('propose')))
        return;
    if (required === 'propose' && permissions.includes('write'))
        return;
    if (!permissions.includes(required))
        throw httpError(403, `token lacks ${required} permission`);
}
async function readObject(req, maximumBytes = MAX_BODY_BYTES) {
    const declared = Number(req.headers['content-length'] ?? 0);
    if (Number.isFinite(declared) && declared > maximumBytes)
        throw httpError(413, 'request body is too large');
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.length;
        if (size > maximumBytes)
            throw httpError(413, 'request body is too large');
        chunks.push(buffer);
    }
    try {
        const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!isRecord(value))
            throw new Error();
        return value;
    }
    catch {
        throw httpError(400, 'request body must be a JSON object');
    }
}
async function readBinary(req, maximumBytes) {
    const declared = Number(req.headers['content-length'] ?? 0);
    if (Number.isFinite(declared) && declared > maximumBytes)
        throw httpError(413, 'request body is too large');
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.byteLength;
        if (size > maximumBytes)
            throw httpError(413, 'request body is too large');
        chunks.push(buffer);
    }
    return Buffer.concat(chunks);
}
async function noteReferences(provider, noteId) {
    const node = provider.notes.get(noteId);
    if (node === undefined)
        throw httpError(404, `note node "${noteId}" was not found`);
    if (node.kind === 'folder')
        return [];
    const structured = provider.noteReferencesForNotes([noteId]);
    const marker = `note://${noteId}`;
    const legacy = (await provider.listDocuments())
        .filter(document => document.content.includes(marker))
        .map(document => ({
        noteId,
        knowledgeBaseId: document.knowledgeBaseId,
        documentId: document.id,
        documentTitle: document.title,
    }));
    return deduplicateNoteReferences([...structured, ...legacy]);
}
async function noteReferencesForSubtree(provider, noteId) {
    const noteIds = provider.notes.subtree(noteId).filter(node => node.kind !== 'folder').map(node => node.id);
    if (noteIds.length === 0)
        return [];
    const structured = provider.noteReferencesForNotes(noteIds);
    const noteIdSet = new Set(noteIds);
    const legacy = (await provider.listDocuments()).flatMap(document => {
        const references = document.content.match(/note:\/\/(note_[a-f0-9]{32})/giu) ?? [];
        return [...new Set(references.map(value => value.slice('note://'.length).toLocaleLowerCase()))]
            .filter(id => noteIdSet.has(id))
            .map(id => ({
            noteId: id,
            knowledgeBaseId: document.knowledgeBaseId,
            documentId: document.id,
            documentTitle: document.title,
        }));
    });
    return deduplicateNoteReferences([...structured, ...legacy]);
}
function deduplicateNoteReferences(references) {
    return [...new Map(references.map(reference => [`${reference.documentId}\u0000${reference.noteId}`, reference])).values()];
}
function parseDraft(value) {
    if (!isRecord(value) || !isRecord(value.scope))
        throw httpError(400, 'draft is invalid');
    if (!isKnowledgeType(value.type))
        throw httpError(400, 'draft type is invalid');
    const scope = value.scope.kind === 'global'
        ? { kind: 'global' }
        : { kind: 'project', id: typeof value.scope.id === 'string' ? value.scope.id : '' };
    try {
        const source = isRecord(value.source) ? parseSource(value.source) : undefined;
        return normalizeDraft({
            knowledgeBaseId: optionalString(value.knowledgeBaseId) ?? DEFAULT_KNOWLEDGE_BASE_ID,
            title: typeof value.title === 'string' ? value.title : '',
            body: typeof value.body === 'string' ? value.body : '',
            type: value.type,
            tags: Array.isArray(value.tags) ? value.tags.filter((tag) => typeof tag === 'string') : [],
            scope,
            confidence: typeof value.confidence === 'number' ? value.confidence : 0.5,
            ...source === undefined ? {} : { source },
        });
    }
    catch (error) {
        throw httpError(400, error instanceof Error ? error.message : 'draft is invalid');
    }
}
function parseProposal(value) {
    if (!isRecord(value) || (value.action !== 'create' && value.action !== 'update' && value.action !== 'conflict')) {
        throw httpError(400, 'proposal is invalid');
    }
    const targetId = optionalString(value.targetId);
    if (value.action !== 'create' && targetId === undefined)
        throw httpError(400, `${value.action} proposal requires targetId`);
    if (value.action === 'create' && value.change !== undefined)
        throw httpError(400, 'create proposal cannot contain a document change');
    return {
        action: value.action,
        ...targetId === undefined ? {} : { targetId },
        ...value.change === undefined ? {} : { change: parseCandidateChange(value.change) },
        draft: parseDraft(value.draft),
        reason: typeof value.reason === 'string' ? value.reason : '',
    };
}
function parseReview(value) {
    if (value.decision !== 'approve' && value.decision !== 'reject')
        throw httpError(400, 'review decision is invalid');
    if (value.resolution !== undefined && value.resolution !== 'merge')
        throw httpError(400, 'review resolution is invalid');
    const note = optionalString(value.note);
    const expectedVersion = value.expectedVersion === undefined ? undefined : Number(value.expectedVersion);
    if (expectedVersion !== undefined && (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1)) {
        throw httpError(400, 'review expectedVersion must be a positive integer');
    }
    return {
        decision: value.decision,
        ...value.resolution === 'merge' ? { resolution: value.resolution } : {},
        ...note === undefined ? {} : { note },
        ...value.draft === undefined ? {} : { draft: parseDraft(value.draft) },
        ...expectedVersion === undefined ? {} : { expectedVersion },
    };
}
function parseCandidateChange(value) {
    if (!isRecord(value))
        throw httpError(400, 'proposal change is invalid');
    if (value.kind === 'append')
        return { kind: 'append' };
    if (value.kind !== 'revise' || !Array.isArray(value.edits))
        throw httpError(400, 'proposal change is invalid');
    const baseVersion = Number(value.baseVersion);
    const baseHash = typeof value.baseHash === 'string' ? value.baseHash.trim().toLocaleLowerCase() : '';
    if (!Number.isSafeInteger(baseVersion) || baseVersion < 1 || !/^[a-f0-9]{64}$/u.test(baseHash)) {
        throw httpError(400, 'proposal revision base is invalid');
    }
    if (value.edits.length < 1 || value.edits.length > 20)
        throw httpError(400, 'proposal revision must contain 1-20 edits');
    const edits = value.edits.map((edit) => {
        if (!isRecord(edit) || typeof edit.oldText !== 'string' || typeof edit.newText !== 'string') {
            throw httpError(400, 'proposal revision edit is invalid');
        }
        if (edit.oldText.length < 1 || edit.oldText.length > 12_000 || edit.newText.length > 12_000) {
            throw httpError(400, 'proposal revision edit is too large or has an empty anchor');
        }
        return { oldText: edit.oldText, newText: edit.newText };
    });
    if (typeof value.append === 'string' && value.append.length > 12_000)
        throw httpError(400, 'proposal revision append is too large');
    return {
        kind: 'revise',
        baseVersion,
        baseHash,
        edits,
        ...typeof value.append === 'string' ? { append: value.append } : {},
    };
}
function parseSource(value) {
    const sessionId = optionalString(value.sessionId);
    const messageId = optionalString(value.messageId);
    const clientId = optionalString(value.clientId);
    const evidence = value.evidence === 'explicit' || value.evidence === 'verified' || value.evidence === 'inferred'
        ? value.evidence
        : undefined;
    return {
        ...sessionId === undefined ? {} : { sessionId },
        ...messageId === undefined ? {} : { messageId },
        ...typeof value.turn === 'number' && Number.isInteger(value.turn) ? { turn: value.turn } : {},
        ...clientId === undefined ? {} : { clientId },
        ...evidence === undefined ? {} : { evidence },
    };
}
function integerParam(url, name, fallback, min, max) {
    const raw = url.searchParams.get(name);
    if (raw === null)
        return fallback;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < min || value > max)
        throw httpError(400, `${name} must be an integer from ${min} to ${max}`);
    return value;
}
function sendJson(res, status, body) {
    if (status === 204) {
        res.writeHead(status, { 'cache-control': 'no-store' });
        res.end();
        return;
    }
    const payload = JSON.stringify(body);
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(payload),
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
    });
    res.end(payload);
}
function sendOpaqueFile(res, originalName, mediaType, content, download) {
    const asciiName = originalName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_') || 'document';
    const encodedName = encodeURIComponent(originalName).replaceAll("'", '%27');
    res.writeHead(200, {
        'content-type': mediaType,
        'content-length': content.byteLength,
        'content-disposition': `${download ? 'attachment' : 'inline'}; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
        'content-security-policy': "sandbox; default-src 'none'",
        'cache-control': 'private, no-store',
        'x-content-type-options': 'nosniff',
    });
    res.end(content);
}
function sendError(res, error) {
    const status = statusOf(error);
    const message = error instanceof Error ? error.message : 'internal knowledge API error';
    sendJson(res, status, { error: status >= 500 ? 'internal knowledge API error' : message, code: codeOf(error) });
}
function statusOf(error) {
    if (isRecord(error) && typeof error.status === 'number')
        return error.status;
    if (isRecord(error) && error.code === 'NOT_FOUND')
        return 404;
    if (isRecord(error) && error.code === 'CONFLICT')
        return 409;
    if (error instanceof Error && /UNIQUE constraint failed/.test(error.message))
        return 409;
    return 500;
}
function codeOf(error) {
    if (isRecord(error) && typeof error.code === 'string')
        return error.code;
    return 'INTERNAL';
}
function httpError(status, message) {
    return Object.assign(new Error(message), { status, code: status === 400 ? 'BAD_REQUEST' : `HTTP_${status}` });
}
function optionalString(value) {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}
function requiredString(value, name) {
    if (typeof value !== 'string' || value.trim().length === 0)
        throw httpError(400, `${name} must be a non-empty string`);
    return value;
}
function nullableString(value, name) {
    if (value === undefined || value === null || value === '')
        return null;
    if (typeof value !== 'string')
        throw httpError(400, `${name} must be a string or null`);
    return value;
}
function optionalNullableStringProperty(value, key) {
    if (!Object.hasOwn(value, key))
        return undefined;
    const member = value[key];
    if (member === null)
        return null;
    if (typeof member !== 'string')
        throw httpError(400, `${key} must be a string or null`);
    return member;
}
function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
//# sourceMappingURL=api.js.map