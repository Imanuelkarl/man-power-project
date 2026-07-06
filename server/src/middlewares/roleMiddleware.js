const roleValidation = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: 'User role not found. Please authenticate first.'
        });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Only ${allowedRoles.join(', ')} can access this resource.`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred during role validation.'
      });
    }
  };
};

// Predefined role constants
const ROLES = {
  ADMIN: 'admin',
  MANUFACTURER: 'manufacturer',
  INVESTOR: 'investor'
};

// Middleware for specific roles
const adminOnly = roleValidation([ROLES.ADMIN]);
const manufacturerOnly = roleValidation([ROLES.MANUFACTURER]);
const investorOnly = roleValidation([ROLES.INVESTOR]);
const adminOrManufacturer = roleValidation([ROLES.ADMIN, ROLES.MANUFACTURER]);
const adminOrInvestor = roleValidation([ROLES.ADMIN, ROLES.INVESTOR]);

module.exports = {
  roleValidation,
  ROLES,
  adminOnly,
  manufacturerOnly,
  investorOnly,
  adminOrManufacturer,
  adminOrInvestor
};
