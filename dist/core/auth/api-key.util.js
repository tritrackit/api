"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryExtractPrefix = exports.sha256Base64 = exports.generateScannerApiKey = void 0;
const crypto_1 = require("crypto");
function generateScannerApiKey() {
    const prefix = (0, crypto_1.randomBytes)(8).toString('hex').slice(0, 12);
    const secret = (0, crypto_1.randomBytes)(24).toString('base64url');
    const raw = `sk_live_${prefix}_${secret}`;
    return { raw, prefix, hash: sha256Base64(raw) };
}
exports.generateScannerApiKey = generateScannerApiKey;
function sha256Base64(s) {
    return (0, crypto_1.createHash)('sha256').update(s, 'utf8').digest('base64');
}
exports.sha256Base64 = sha256Base64;
function tryExtractPrefix(raw) {
    const m = /^sk_[\w-]+_([a-f0-9]{8,16})_/.exec(raw);
    return m === null || m === void 0 ? void 0 : m[1];
}
exports.tryExtractPrefix = tryExtractPrefix;
//# sourceMappingURL=api-key.util.js.map