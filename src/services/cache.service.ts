import { Injectable, Logger } from "@nestjs/common";
import NodeCache from "node-cache";
import { randomBytes, createHash } from "crypto";

export interface CacheOptions {
  ttlSeconds?: number;
}

@Injectable()
export class CacheService {
  private static _shared: NodeCache | null = null;
  private static _epoch = 1; // <— versioned namespace for keys

  private readonly cache: NodeCache;
  private readonly log = new Logger(CacheService.name);
  private readonly defaultTtl = Number(process.env.CACHE_TTL_SECONDS ?? 60);
  private readonly maxKeyLen = Number(process.env.CACHE_MAX_KEY_LEN ?? 250);
  readonly instanceId = randomBytes(3).toString("hex");

  constructor() {
    if (!CacheService._shared) {
      CacheService._shared = new NodeCache({
        stdTTL: this.defaultTtl,
        checkperiod: Math.max(30, Math.floor(this.defaultTtl / 2)),
        useClones: false,
      });
      if (process.env.CACHE_FLUSH_ON_BOOT === "true") {
        CacheService._shared.flushAll();
      }
      this.log.log(
        `Cache created pid=${process.pid} stdTTL=${this.defaultTtl}s epoch=${CacheService._epoch}`
      );
    }
    this.cache = CacheService._shared!;
  }

  /** Prefix every key with an epoch so bumping the epoch invalidates all old keys instantly. */
  private norm(raw: string): string {
    const k = raw ?? "";
    const v = `e${CacheService._epoch}:`; // namespace
    if (k.length <= this.maxKeyLen) return v + k;
    const hash = createHash("sha1").update(k).digest("hex");
    const head = k.slice(0, 48).replace(/[:\s]/g, "_");
    return `${v}${head}:${hash}`;
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(this.norm(key));
  }

  set<T>(key: string, value: T, opts?: CacheOptions): void {
    const ttl = opts?.ttlSeconds ?? this.defaultTtl;
    this.cache.set<T>(this.norm(key), value, ttl);
  }

  del(key: string): void {
    this.cache.del(this.norm(key));
  }

  delByPrefix(prefix: string): void {
    const p = this.norm(prefix);
    const keys = this.cache.keys().filter((k) => k.startsWith(p));
    if (keys.length) {
      this.cache.del(keys);
      this.log.debug(
        `Invalidated ${keys.length} key(s) with prefix "${prefix}"`
      );
    }
  }

  /** Strongest clear: empty NodeCache AND bump epoch so any stragglers are ignored. */
  flushAll(): void {
    const before = this.cache.keys().length;
    this.cache.flushAll();
    CacheService._epoch++; // <- nukes visibility of any previously generated keys
    const after = this.cache.keys().length;
    this.log.warn(
      `flushAll() pid=${process.pid} before=${before} after=${after} epoch=${CacheService._epoch}`
    );
  }

  // Handy helpers
  has(key: string): boolean {
    return this.cache.has(this.norm(key));
  }
  keys(): string[] {
    return this.cache.keys();
  }
  size(): number {
    return this.cache.keys().length;
  }

  async getOrSet<T>(
    key: string,
    producer: () => Promise<T>,
    opts?: CacheOptions
  ): Promise<T> {
    const k = this.norm(key);
    const hit = this.cache.get<T>(k);
    if (hit !== undefined) return hit;
    const val = await producer();
    this.cache.set<T>(k, val, opts?.ttlSeconds ?? this.defaultTtl);
    return val;
  }
}
