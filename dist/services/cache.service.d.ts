export interface CacheOptions {
    ttlSeconds?: number;
}
export declare class CacheService {
    private static _shared;
    private static _epoch;
    private readonly cache;
    private readonly log;
    private readonly defaultTtl;
    private readonly maxKeyLen;
    readonly instanceId: string;
    constructor();
    private norm;
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, opts?: CacheOptions): void;
    del(key: string): void;
    delByPrefix(prefix: string): void;
    flushAll(): void;
    has(key: string): boolean;
    keys(): string[];
    size(): number;
    getOrSet<T>(key: string, producer: () => Promise<T>, opts?: CacheOptions): Promise<T>;
}
