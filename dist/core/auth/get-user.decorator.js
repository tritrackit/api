"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUser = void 0;
const common_1 = require("@nestjs/common");
exports.GetUser = (0, common_1.createParamDecorator)((data, ctx) => {
    var _a;
    const req = ctx.switchToHttp().getRequest();
    return data ? (_a = req.user) === null || _a === void 0 ? void 0 : _a[data] : req.user;
});
//# sourceMappingURL=get-user.decorator.js.map