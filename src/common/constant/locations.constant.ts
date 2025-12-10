export const LOCATIONS_ERROR_NOT_FOUND = "Location not found!";

// FIXED LOCATIONS - No CRUD allowed, predefined in reset procedure
export const FIXED_LOCATIONS = {
    OPEN_AREA: {
      id: 'OPEN_AREA', // WAS: '4'
      name: 'Open Area',
      code: 'OPEN_AREA'
    },
    WAREHOUSE_4: {
      id: 'WAREHOUSE_4',
      name: 'Warehouse 4',
      code: 'WAREHOUSE_4'
    },
    WAREHOUSE_5: {
      id: 'WAREHOUSE_5', // WAS: '5'
      name: 'Warehouse 5',
      code: 'WAREHOUSE_5'
    },
    DELIVERED: {
      id: 'DELIVERED',
      name: 'Delivered',
      code: 'DELIVERED'
    }
  } as const;

export const FIXED_LOCATION_IDS: string[] = Object.values(FIXED_LOCATIONS).map(loc => loc.id);
export const FIXED_LOCATION_NAMES: string[] = Object.values(FIXED_LOCATIONS).map(loc => loc.name);
export const FIXED_LOCATION_CODES: string[] = Object.values(FIXED_LOCATIONS).map(loc => loc.code);