import Schema from '@deepseek-ai/schemastery';
export interface Config {
    backend: 'local' | 'remote';
    databasePath?: string;
    remoteUrl?: string;
    remoteToken?: string;
    remoteTimeoutMs: number;
    connectionPath?: string;
    exposeApi: boolean;
    apiToken?: string;
    apiPrefix: string;
    exposeWeb: boolean;
    webPath: string;
    extractionEnabled: boolean;
    extractionProvider?: string;
    extractionModel?: string;
    extractionMaxTokens: number;
    extractionTimeoutMs: number;
    extractionMaxInputChars: number;
    defaultScope: 'project' | 'global';
    autoRecallLimit: number;
    autoRecallMinScore: number;
    recallMaxChars: number;
}
export declare const Config: Schema<Config>;
export interface ResolvedConfig extends Config {
    remoteTimeoutMs: number;
    apiPrefix: string;
    exposeWeb: boolean;
    webPath: string;
    extractionMaxTokens: number;
    extractionTimeoutMs: number;
    extractionMaxInputChars: number;
    defaultScope: 'project' | 'global';
    autoRecallLimit: number;
    autoRecallMinScore: number;
    recallMaxChars: number;
}
export declare function resolveConfig(config: Config): ResolvedConfig;
//# sourceMappingURL=config.d.ts.map