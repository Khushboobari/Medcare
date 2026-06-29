const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized to access this route, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medcare_jwt_secret_key_2026_xyz');
    req.user = decoded; // Contains id and role
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access denied. Admin role required" });
  }
};
