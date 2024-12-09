const jwt = require("jsonwebtoken");

/**
 * Generate JWT token with provided payload and optional expiry
 * @param {Object} payload - Data to encode in the token
 * @param {string} [expiresIn="24h"] - Token expiry time
 * @returns {string} - Signed JWT token
 */
function generateToken(payload, expiresIn = "24h") {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT token and return decoded data
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token data
 * @throws {Error} - If token is invalid or verification fails
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

/**
 * Set JWT token in cookies with configurable options
 * @param {Object} res - Express response object
 * @param {string} token - JWT token to set in cookies
 * @param {Object} [options={}] - Additional cookie options
 */
function setTokenCookie(res, token, options = {}) {
  const defaultOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV !== "production",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: "/",
    sameSite: "none", // Allow cross-site usage
  };

  res.cookie("token", token, { ...defaultOptions, ...options });
}

module.exports = {
  generateToken,
  verifyToken,
  setTokenCookie,
};
