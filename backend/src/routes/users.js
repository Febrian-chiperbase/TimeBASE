const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user.toJSON()
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user profile'
        });
    }
});

// Update user preferences
router.put('/preferences', auth, [
    body('workingHours').optional().isArray().withMessage('Working hours must be an array'),
    body('timezone').optional().isString().withMessage('Timezone must be a string'),
    body('breakDuration').optional().isInt({ min: 5, max: 60 }).withMessage('Break duration must be between 5-60 minutes'),
    body('maxContinuousWork').optional().isInt({ min: 30, max: 240 }).withMessage('Max continuous work must be between 30-240 minutes')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: errors.array()
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update preferences
        const allowedFields = [
            'workingHours', 'timezone', 'breakDuration', 
            'maxContinuousWork', 'preferredTaskOrder', 'notificationSettings'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                user.preferences[field] = req.body[field];
            }
        });

        await user.save();

        res.json({
            success: true,
            data: user.toJSON(),
            message: 'Preferences updated successfully'
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences'
        });
    }
});

// Update user profile
router.put('/profile', auth, [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: errors.array()
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check if email is already taken by another user
        if (req.body.email && req.body.email !== user.email) {
            const existingUser = await User.findOne({ 
                email: req.body.email,
                _id: { $ne: user._id }
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is already taken'
                });
            }
        }

        // Update allowed fields
        const allowedFields = ['name', 'email'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        await user.save();

        res.json({
            success: true,
            data: user.toJSON(),
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Soft delete - mark as inactive
        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: 'Account deactivated successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete account'
        });
    }
});

module.exports = router;
