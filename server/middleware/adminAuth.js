// Admin and Team authorization middleware

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const requireAdminOrTeam = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'team') {
    return res.status(403).json({ message: 'Admin or team access required' });
  }
  next();
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Team member needs specific permission
    if (req.user.role === 'team' && req.user.permissions && req.user.permissions[permission]) {
      return next();
    }

    return res.status(403).json({ 
      message: `Permission denied: ${permission} required` 
    });
  };
};
