import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    // 1. get token from headers
    const authHeader = req.headers['authorization']; // Bearer <token>
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        ok: false,
        status: 401,
        message: "Unauthorized: No token provided",
        data: null,
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach payload to req.user
    req.user = decoded; // payload contains id, role

    next(); // proceed to controller
  } catch (err) {
    console.error("verifyToken middleware error:", err);
    return res.status(403).json({
      ok: false,
      status: 403,
      message: "Forbidden: Invalid token",
      data: null,
    });
  }
};


// Role-based access control middleware
// roles: ADMIN, MANAGER, STAFF
export const verifyRole = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        status: 403,
        message: "Forbidden: Insufficient permissions",
        data: null,
      });
    }
    
    next();
  };
};