const express = require('express');
const router = express.Router();
const freeAIController = require('../controllers/freeAIController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Rate limiting khusus untuk AI endpoints (lebih ketat karena gratis)
const aiRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.AI_RATE_LIMIT_PER_HOUR || 50, // 50 requests per hour
    message: {
        success: false,
        error: 'AI API rate limit exceeded',
        message: 'Terlalu banyak permintaan AI. Coba lagi dalam 1 jam.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Validation middleware
const validateScheduleRequest = [
    body('tasks').isArray().withMessage('Tasks must be an array'),
    body('preferences').isObject().withMessage('Preferences must be an object'),
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
 * POST /api/free-ai/optimize-schedule
 * Optimasi jadwal menggunakan AI gratis dengan fallback
 */
router.post('/optimize-schedule', 
    auth, 
    aiRateLimit, 
    validateScheduleRequest, 
    freeAIController.optimizeSchedule
);

/**
 * POST /api/free-ai/productivity-tips
 * Mendapatkan tips produktivitas dari AI gratis
 */
router.post('/productivity-tips', 
    auth, 
    aiRateLimit, 
    [
        body('userMetrics').isObject().withMessage('User metrics must be an object'),
        body('goals').isArray().withMessage('Goals must be an array')
    ], 
    freeAIController.getProductivityTips
);

/**
 * POST /api/free-ai/mood-analysis
 * Analisis mood dan energi menggunakan AI gratis
 */
router.post('/mood-analysis', 
    auth, 
    aiRateLimit, 
    [
        body('taskHistory').isArray().withMessage('Task history must be an array'),
        body('currentContext').isObject().withMessage('Current context must be an object')
    ], 
    freeAIController.analyzeMoodAndEnergy
);

/**
 * GET /api/free-ai/status
 * Check status AI services yang tersedia
 */
router.get('/status', auth, async (req, res) => {
    try {
        const status = {
            huggingFace: !!process.env.HUGGINGFACE_API_TOKEN,
            cohere: !!process.env.COHERE_API_KEY,
            gemini: !!process.env.GEMINI_API_KEY,
            openai: !!process.env.OPENAI_API_KEY,
            fallbackEnabled: process.env.AI_FALLBACK_ENABLED === 'true',
            rateLimit: {
                maxRequestsPerHour: process.env.AI_RATE_LIMIT_PER_HOUR || 50,
                currentUsage: req.rateLimit?.current || 0,
                remaining: req.rateLimit?.remaining || 50
            }
        };
        
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get AI status'
        });
    }
});

module.exports = router;
