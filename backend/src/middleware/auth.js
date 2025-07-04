const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        // For development, create a mock user if not exists
        let user = await User.findById(decoded.id);
        if (!user) {
            user = {
                id: decoded.id || 'mock_user_id',
                email: decoded.email || 'user@example.com',
                name: decoded.name || 'Test User'
            };
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token.'
        });
    }
};

module.exports = auth;
