import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  console.log("✅ req exists:", !!req);
  console.log("✅ req.cookies:", req.cookies);
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // ✅ verify token using your secret
    const payload = jwt.verify(token, process.env.JWT_KEY);

    // ✅ attach user object for consistency with controllers
    req.user = {
      id: payload.id,  // ✅ JWT was created with 'id', not 'userId'
      email: payload.email
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(400).json({ error: "Invalid token." });
  }
};
