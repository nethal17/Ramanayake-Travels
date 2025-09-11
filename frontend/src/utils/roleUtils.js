// Utility function to check if a user is a driver
export const isDriver = (user) => {
  return user?.role === 'driver';
};

// Utility function to check if a user is an admin
export const isAdmin = (user) => {
  return user?.role === 'admin';
};

// Utility function to check if a user is a customer
export const isCustomer = (user) => {
  return user?.role === 'customer';
};

// Get the appropriate profile path based on user role
export const getProfilePath = (user) => {
  if (!user) return '/';
  
  if (isDriver(user)) {
    return '/driver-profile';
  } else if (isAdmin(user)) {
    return '/admin/dashboard';
  } else {
    return '/customer-profile';
  }
};

// Function to check if a user has certain permissions
export const hasPermission = (user, permission) => {
  if (!user) return false;
  
  // Admin has all permissions
  if (isAdmin(user)) return true;
  
  // Different permissions based on roles
  switch (permission) {
    case 'view_admin_dashboard':
      return isAdmin(user);
    case 'manage_vehicles':
      return isAdmin(user);
    case 'book_vehicle':
      return isCustomer(user);
    case 'view_driver_profile':
      return isDriver(user);
    default:
      return false;
  }
};
