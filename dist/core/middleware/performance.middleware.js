"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMiddleware = void 0;
const common_1 = require("@nestjs/common");
let PerformanceMiddleware = class PerformanceMiddleware {
    constructor() {
        this.logger = new common_1.Logger('Performance');
    }
    use(req, res, next) {
        const start = Date.now();
        const { method, originalUrl } = req;
        const isPusherRequest = originalUrl.includes('/units/') &&
            (method === 'POST' || method === 'PUT');
        if (isPusherRequest) {
            req.headers['x-request-start'] = start.toString();
            req.headers['x-transaction-id'] = `req_${start}_${Math.random().toString(36).substr(2, 9)}`;
        }
        res.on('finish', () => {
            const duration = Date.now() - start;
            const { statusCode } = res;
            if (isPusherRequest && duration > 100) {
                this.logger.warn(`🚨 SLOW ${method} ${originalUrl}: ${duration}ms (${statusCode})`);
            }
            else if (isPusherRequest) {
                this.logger.debug(`⚡ ${method} ${originalUrl}: ${duration}ms (${statusCode})`);
            }
        });
        next();
    }
};
PerformanceMiddleware = __decorate([
    (0, common_1.Injectable)()
], PerformanceMiddleware);
exports.PerformanceMiddleware = PerformanceMiddleware;
//# sourceMappingURL=performance.middleware.js.map