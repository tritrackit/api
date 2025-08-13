"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const node_cache_1 = __importDefault(require("node-cache"));
const crypto_1 = require("crypto");
let CacheService = CacheService_1 = class CacheService {
    constructor() {
        var _a, _b;
        this.log = new common_1.Logger(CacheService_1.name);
        this.defaultTtl = Number((_a = process.env.CACHE_TTL_SECONDS) !== null && _a !== void 0 ? _a : 60);
        this.maxKeyLen = Number((_b = process.env.CACHE_MAX_KEY_LEN) !== null && _b !== void 0 ? _b : 250);
        this.instanceId = (0, crypto_1.randomBytes)(3).toString("hex");
        if (!CacheService_1._shared) {
            CacheService_1._shared = new node_cache_1.default({
                stdTTL: this.defaultTtl,
                checkperiod: Math.max(30, Math.floor(this.defaultTtl / 2)),
                useClones: false,
            });
            if (process.env.CACHE_FLUSH_ON_BOOT === "true") {
                CacheService_1._shared.flushAll();
            }
            this.log.log(`Cache created pid=${process.pid} stdTTL=${this.defaultTtl}s epoch=${CacheService_1._epoch}`);
        }
        this.cache = CacheService_1._shared;
    }
    norm(raw) {
        const k = raw !== null && raw !== void 0 ? raw : "";
        const v = `e${CacheService_1._epoch}:`;
        if (k.length <= this.maxKeyLen)
            return v + k;
        const hash = (0, crypto_1.createHash)("sha1").update(k).digest("hex");
        const head = k.slice(0, 48).replace(/[:\s]/g, "_");
        return `${v}${head}:${hash}`;
    }
    get(key) {
        return this.cache.get(this.norm(key));
    }
    set(key, value, opts) {
        var _a;
        const ttl = (_a = opts === null || opts === void 0 ? void 0 : opts.ttlSeconds) !== null && _a !== void 0 ? _a : this.defaultTtl;
        this.cache.set(this.norm(key), value, ttl);
    }
    del(key) {
        this.cache.del(this.norm(key));
    }
    delByPrefix(prefix) {
        const p = this.norm(prefix);
        const keys = this.cache.keys().filter((k) => k.startsWith(p));
        if (keys.length) {
            this.cache.del(keys);
            this.log.debug(`Invalidated ${keys.length} key(s) with prefix "${prefix}"`);
        }
    }
    flushAll() {
        const before = this.cache.keys().length;
        this.cache.flushAll();
        CacheService_1._epoch++;
        const after = this.cache.keys().length;
        this.log.warn(`flushAll() pid=${process.pid} before=${before} after=${after} epoch=${CacheService_1._epoch}`);
    }
    has(key) {
        return this.cache.has(this.norm(key));
    }
    keys() {
        return this.cache.keys();
    }
    size() {
        return this.cache.keys().length;
    }
    async getOrSet(key, producer, opts) {
        var _a;
        const k = this.norm(key);
        const hit = this.cache.get(k);
        if (hit !== undefined)
            return hit;
        const val = await producer();
        this.cache.set(k, val, (_a = opts === null || opts === void 0 ? void 0 : opts.ttlSeconds) !== null && _a !== void 0 ? _a : this.defaultTtl);
        return val;
    }
};
CacheService._shared = null;
CacheService._epoch = 1;
CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CacheService);
exports.CacheService = CacheService;
//# sourceMappingURL=cache.service.js.map