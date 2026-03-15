const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const company = await Company.findById(decoded.id);

    if (!company) {
      return res.status(401).json({ error: 'Token is invalid. User not found.' });
    }

    req.company = company;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired.' });
    }
    return res.status(500).json({ error: 'Authentication error.' });
  }
};

module.exports = { protect };