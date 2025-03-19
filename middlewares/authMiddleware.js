const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
  
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded access token:", decoded);

      req.user = decoded; 
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };


exports.roleMiddleware = (role) => (req, res, next) => {+3
    if (req.user.role !== role) {
        return res.status(403).json({message: "Forbidden"});
    }
    next();
};