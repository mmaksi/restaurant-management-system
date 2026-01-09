export interface DemoManager {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  restaurantIds: string[]; // List of restaurant IDs this manager has access to
  banned: boolean;
  authRole: 'manager';
  adminId: string;
}

export const demoManagers: DemoManager[] = [
  {
    id: 'mgr-001',
    username: 'john.smith',
    password: 'password123',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@restaurants.com',
    restaurantIds: ['rest-001'], // La Bella Vista
    banned: false,
    authRole: 'manager',
    adminId: '6ef01d19-3210-411c-893f-94a26b2565be',
  },
  {
    id: 'mgr-002',
    username: 'sarah.jones',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Jones',
    email: 'sarah.jones@restaurants.com',
    restaurantIds: ['rest-002'], // The Urban Kitchen
    banned: false,
    authRole: 'manager',
    adminId: '6ef01d19-3210-411c-893f-94a26b2565be',
  },
  {
    id: 'mgr-003',
    username: 'mike.brown',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Brown',
    email: 'mike.brown@restaurants.com',
    restaurantIds: ['rest-003'], // Sunrise Café
    banned: true, // Example of a banned manager
    authRole: 'manager',
    adminId: '6ef01d19-3210-411c-893f-94a26b2565be',
  },
  {
    id: 'mgr-004',
    username: 'emily.davis',
    password: 'password123',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@restaurants.com',
    restaurantIds: ['rest-004'], // Quick Bites Express
    banned: false,
    authRole: 'manager',
    adminId: '6ef01d19-3210-411c-893f-94a26b2565be',
  },
  {
    id: 'mgr-005',
    username: 'robert.wilson',
    password: 'password123',
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.wilson@restaurants.com',
    restaurantIds: ['rest-001', 'rest-002'], // Multi-location manager: La Bella Vista & The Urban Kitchen
    banned: false,
    authRole: 'manager',
    adminId: '6ef01d19-3210-411c-893f-94a26b2565be',
  },
  {
    id: 'mgr-006',
    username: 'lisa.anderson',
    password: 'password123',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'mmaksi.dev@gmail.com',
    restaurantIds: ['rest-003', 'rest-004'], // Multi-location manager: Sunrise Café & Quick Bites Express
    banned: false,
    authRole: 'manager',
    adminId: '6ef01d19-3210-411c-893f-94a26b2565be',
  },
  {
    id: 'mgr-007',
    username: 'admin',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@restaurants.com',
    restaurantIds: ['rest-001', 'rest-002', 'rest-003', 'rest-004'], // Super admin with access to all restaurants
    banned: false,
    authRole: 'manager',
    adminId: '6ef01d19-3210-411c-893f-94a26b2565be',
  },
];

// Helper function to get manager by username
export const getManagerByUsername = (
  username: string
): DemoManager | undefined => {
  return demoManagers.find((manager) => manager.username === username);
};

// Helper function to authenticate manager
export const authenticateManager = (
  username: string,
  password: string
): DemoManager | null => {
  const manager = demoManagers.find(
    (m) => m.username === username && m.password === password && !m.banned
  );
  return manager || null;
};

// Helper function to get restaurants for a manager
export const getManagerRestaurants = (managerId: string): string[] => {
  const manager = demoManagers.find((m) => m.id === managerId);
  return manager?.restaurantIds || [];
};

// Helper function to check if manager has access to a restaurant
export const hasRestaurantAccess = (
  managerId: string,
  restaurantId: string
): boolean => {
  const manager = demoManagers.find((m) => m.id === managerId);
  return manager?.restaurantIds.includes(restaurantId) || false;
};
