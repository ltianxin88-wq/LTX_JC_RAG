import { type NoteFileUpload, type NoteListRequest, type NoteNode } from './domain.js';
export declare class NoteStore {
    private readonly rootPath;
    private readonly removeOnClose;
    private readonly db;
    private readonly objectsPath;
    private closed;
    constructor(rootPath: string, removeOnClose?: boolean);
    list(request?: NoteListRequest): NoteNode[];
    get(id: string): NoteNode | undefined;
    subtree(id: string): NoteNode[];
    createFolder(name: string, parentId?: string | null): Promise<NoteNode>;
    createDocument(name: string, parentId?: string | null, content?: string): Promise<NoteNode>;
    upload(upload: NoteFileUpload): Promise<NoteNode>;
    read(id: string): Promise<{
        node: NoteNode;
        content: Buffer;
    }>;
    updateContent(id: string, content: Uint8Array): Promise<NoteNode>;
    rename(id: string, name: string): NoteNode;
    move(id: string, parentId: string | null): NoteNode;
    copy(id: string, parentId?: string | null, requestedName?: string): Promise<NoteNode>;
    delete(id: string): Promise<void>;
    close(): Promise<void>;
    private createNode;
    private copyNode;
    private availableCopyName;
    private requireNode;
    private children;
    private assertFolder;
    private assertNameAvailable;
    private nameExists;
    private isDescendant;
    private migrate;
    private objectPath;
    private assertOpen;
}
export declare function normalizeNoteName(value: string): string;
//# sourceMappingURL=store.d.ts.map