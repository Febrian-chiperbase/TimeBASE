const express = require('express');
const router = express.Router();
const timeSuggestionController = require('../controllers/timeSuggestionController');
const auth = require('../middleware/auth');
const { body, query, validationResult } = require('express-validator');

// Middleware untuk validasi input
const validateSuggestionRequest = [
    body('taskName')
        .notEmpty()
        .withMessage('Task name is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Task name must be between 3 and 200 characters')
        .trim(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: errors.array()
            });
        }
        next();
    }
];

const validateFeedbackRequest = [
    body('taskName').notEmpty().withMessage('Task name is required').trim(),
    body('suggestedTime').isInt({ min: 1 }).withMessage('Suggested time must be a positive integer'),
    body('actualTime').isInt({ min: 1 }).withMessage('Actual time must be a positive integer'),
    body('accepted').isBoolean().withMessage('Accepted must be a boolean'),
    body('feedback').optional().isString().trim(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: errors.array()
            });
        }
        next();
    }
];

const validateHistoryQuery = [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: errors.array()
            });
        }
        next();
    }
];

/**
 * POST /api/time-suggestion
 * Mendapatkan saran waktu berdasarkan nama tugas
 * 
 * Request Body:
 * {
 *   "taskName": "Buat laporan penjualan"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "taskName": "Buat laporan penjualan",
 *     "suggestion": {
 *       "saranWaktu": 45,
 *       "confidence": 0.7,
 *       "tugasSerupa": [...],
 *       "statistik": {...},
 *       "alasan": "Berdasarkan 5 tugas serupa..."
 *     }
 *   }
 * }
 */
router.post('/', auth, validateSuggestionRequest, timeSuggestionController.getSuggestion);

/**
 * POST /api/time-suggestion/detailed
 * Mendapatkan saran waktu dengan analisis detail
 */
router.post('/detailed', auth, validateSuggestionRequest, timeSuggestionController.getDetailedSuggestion);

/**
 * GET /api/time-suggestion/history
 * Mendapatkan riwayat saran waktu dan akurasi estimasi
 * 
 * Query Parameters:
 * - limit: number (default: 20, max: 100)
 * - page: number (default: 1)
 */
router.get('/history', auth, validateHistoryQuery, timeSuggestionController.getSuggestionHistory);

/**
 * POST /api/time-suggestion/feedback
 * Submit feedback untuk saran waktu
 * 
 * Request Body:
 * {
 *   "taskName": "Buat laporan penjualan",
 *   "suggestedTime": 45,
 *   "actualTime": 60,
 *   "accepted": true,
 *   "feedback": "Saran cukup akurat"
 * }
 */
router.post('/feedback', auth, validateFeedbackRequest, timeSuggestionController.submitFeedback);

// Error handling middleware khusus untuk routes ini
router.use((error, req, res, next) => {
    console.error('Time suggestion routes error:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: error.message
        });
    }
    
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : error.message
    });
});

module.exports = router;
