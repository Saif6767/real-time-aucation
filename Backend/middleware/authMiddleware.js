import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  // Flexible token extraction:
  // 1) Authorization: Bearer <token>
  // 2) Authorization: <token>
  // 3) x-access-token header
  // 4) req.body.token (forms/multipart)
  // 5) req.query.token
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    // support both 'Bearer <token>' and raw token
    token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  }

  if (!token) token = req.headers["x-access-token"] || req.body?.token || req.query?.token;

  if (!token) return res.status(401).json({ message: "Unauthorized: no token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    // Differentiate expired tokens from other errors for clearer client feedback
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};
