const jwt = require("jsonwebtoken");
const { env } = require("process");
const userModel = require("../modules/users/model/user.model");




function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.userId = decoded.userId;
    req.permissions = decoded.permissions;

    next();
  });
}


const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const {userId, permissions} = req;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User not authenticated" });
    }

    try {
      // Check if the user's role has the required permission
      console.log(permissions);
      if (permissions.includes(requiredPermission)) {
        next(); // User has the required permission, proceed to the next middleware or route handler
      } else {
        res
          .status(403)
          .json({ message: "Forbidden - Insufficient permissions" });
      }
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
};

module.exports = { verifyToken, checkPermission };
