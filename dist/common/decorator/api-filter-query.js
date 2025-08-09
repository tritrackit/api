"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiFilterQuery = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
function ApiFilterQuery(fieldName, filterDto) {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiExtraModels)(filterDto), (0, swagger_1.ApiQuery)({
        required: false,
        name: fieldName,
        type: "object",
        schema: {
            $ref: (0, swagger_1.getSchemaPath)(filterDto),
        },
    }));
}
exports.ApiFilterQuery = ApiFilterQuery;
//# sourceMappingURL=api-filter-query.js.map