const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const header = req.headers["authorization"] || req.headers["Authorization"];
  if (!header) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Support both raw token and "Bearer <token>" formats
  const parts = String(header).split(' ');
  const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : header;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { authenticate }
