const jwt = require('jsonwebtoken');
const { env } = require("process");
function verifyToken(req, res, next) {
  const token = req.headers['authorization'].replace('Bearer ', '');

  if (!token) {
    return res.status(403).json({ message: 'Token not provided' });
  }

  jwt.verify(token, env.JWT_SECRET , (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  });
}

function checkUserRole(role) {
  
  return (req, res, next) => {
    const userRole = req.role;
    if (userRole !== role) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}
module.exports = {verifyToken , checkUserRole};
