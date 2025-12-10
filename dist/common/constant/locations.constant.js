"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIXED_LOCATION_CODES = exports.FIXED_LOCATION_NAMES = exports.FIXED_LOCATION_IDS = exports.FIXED_LOCATIONS = exports.LOCATIONS_ERROR_NOT_FOUND = void 0;
exports.LOCATIONS_ERROR_NOT_FOUND = "Location not found!";
exports.FIXED_LOCATIONS = {
    OPEN_AREA: {
        id: 'OPEN_AREA',
        name: 'Open Area',
        code: 'OPEN_AREA'
    },
    WAREHOUSE_4: {
        id: 'WAREHOUSE_4',
        name: 'Warehouse 4',
        code: 'WAREHOUSE_4'
    },
    WAREHOUSE_5: {
        id: 'WAREHOUSE_5',
        name: 'Warehouse 5',
        code: 'WAREHOUSE_5'
    },
    DELIVERED: {
        id: 'DELIVERED',
        name: 'Delivered',
        code: 'DELIVERED'
    }
};
exports.FIXED_LOCATION_IDS = Object.values(exports.FIXED_LOCATIONS).map(loc => loc.id);
exports.FIXED_LOCATION_NAMES = Object.values(exports.FIXED_LOCATIONS).map(loc => loc.name);
exports.FIXED_LOCATION_CODES = Object.values(exports.FIXED_LOCATIONS).map(loc => loc.code);
//# sourceMappingURL=locations.constant.js.map