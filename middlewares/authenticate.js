// middleware/authenticate.js
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

const authenticate = (requiredRole, pass) => async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.header('Authorization').replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' })
    }

    // Verify the token and decode the payload
    const decoded = jwt.verify(token, JWT_SECRET)

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    req.user = decoded // Attach decoded token data to request object (e.g., userId and role)

    if (requiredRole == 'admin') {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' })
      }
    } else {
      // Check if user exists in the database
      const user = await User.findById(req.user._id)
      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }

     
      // Check if the user has the required role if specified
      if (!pass && requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    next() // Proceed to the next middleware or route handler
  } catch (error) {
    console.log(error)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    res.status(401).json({ message: 'Invalid token', error })
  }
}

module.exports = authenticate
