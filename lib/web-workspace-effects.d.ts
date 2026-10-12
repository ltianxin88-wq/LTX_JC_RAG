interface WorkspaceEffectsApi {
    refresh(root?: ParentNode): void;
    destroy(): void;
}
declare global {
    interface Window {
        DshKnowledgeEffects?: WorkspaceEffectsApi;
    }
}
declare function refresh(root?: ParentNode): void;
declare function destroy(): void;
export { destroy, refresh };
//# sourceMappingURL=web-workspace-effects.d.ts.map