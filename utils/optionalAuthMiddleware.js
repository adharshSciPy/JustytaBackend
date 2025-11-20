import jwt from "jsonwebtoken";

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token → continue without user
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      req.user = null;
      return next();
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;

    return next();
  } catch (err) {
    // If token invalid → ignore, treat as no user
    req.user = null;
    return next();
  }
};
