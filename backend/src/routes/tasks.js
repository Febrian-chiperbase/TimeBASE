const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

// Middleware untuk validasi input
const validateTaskInput = [
    body('title').notEmpty().withMessage('Title is required'),
    body('priority').isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Priority must be HIGH, MEDIUM, or LOW'),
    body('estimatedDuration').isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
    body('category').optional().isString(),
    body('description').optional().isString(),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO date'),
    body('difficultyLevel').optional().isInt({ min: 1, max: 5 }).withMessage('Difficulty level must be between 1-5'),
    body('energyRequired').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Energy required must be LOW, MEDIUM, or HIGH'),
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

const validateTaskId = [
    param('taskId').isMongoId().withMessage('Invalid task ID'),
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

const validateQueryParams = [
    query('status').optional().isIn(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
    query('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid priority'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
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

// Routes untuk manajemen tugas

/**
 * GET /api/tasks
 * Mendapatkan semua tugas dengan opsi filter dan pagination
 */
router.get('/', auth, validateQueryParams, taskController.getAllTasks);

/**
 * GET /api/tasks/recommended
 * Mendapatkan rekomendasi tugas berdasarkan scoring logic
 */
router.get('/recommended', auth, [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1-50')
], taskController.getRecommendedTasks);

/**
 * GET /api/tasks/statistics
 * Mendapatkan statistik tugas dan scoring
 */
router.get('/statistics', auth, taskController.getTaskStatistics);

/**
 * GET /api/tasks/:taskId/scoring
 * Mendapatkan detail scoring untuk tugas tertentu
 */
router.get('/:taskId/scoring', auth, validateTaskId, taskController.getTaskScoringDetails);

/**
 * POST /api/tasks
 * Membuat tugas baru
 */
router.post('/', auth, validateTaskInput, taskController.createTask);

/**
 * PUT /api/tasks/:taskId
 * Memperbarui tugas
 */
router.put('/:taskId', auth, validateTaskId, [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Priority must be HIGH, MEDIUM, or LOW'),
    body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
    body('category').optional().isString(),
    body('description').optional().isString(),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO date'),
    body('difficultyLevel').optional().isInt({ min: 1, max: 5 }).withMessage('Difficulty level must be between 1-5'),
    body('energyRequired').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Energy required must be LOW, MEDIUM, or HIGH')
], taskController.updateTask);

/**
 * DELETE /api/tasks/:taskId
 * Menghapus tugas
 */
router.delete('/:taskId', auth, validateTaskId, taskController.deleteTask);

/**
 * PATCH /api/tasks/:taskId/complete
 * Menandai tugas sebagai selesai
 */
router.patch('/:taskId/complete', auth, validateTaskId, [
    body('actualDuration').optional().isInt({ min: 1 }).withMessage('Actual duration must be a positive integer')
], taskController.completeTask);

/**
 * PATCH /api/tasks/:taskId/status
 * Mengubah status tugas (pause/resume/cancel)
 */
router.patch('/:taskId/status', auth, validateTaskId, [
    body('status').isIn(['ACTIVE', 'PAUSED', 'CANCELLED']).withMessage('Status must be ACTIVE, PAUSED, or CANCELLED')
], taskController.updateTaskStatus);

/**
 * POST /api/tasks/:taskId/simulate-score
 * Simulasi perubahan skor jika prioritas atau deadline diubah
 */
router.post('/:taskId/simulate-score', auth, validateTaskId, [
    body('newPriority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('New priority must be HIGH, MEDIUM, or LOW'),
    body('newDueDate').optional().isISO8601().withMessage('New due date must be a valid ISO date')
], taskController.simulateScoreChange);

// Error handling middleware khusus untuk routes ini
router.use((error, req, res, next) => {
    console.error('Task routes error:', error);
    
    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format',
            message: 'The provided ID is not valid'
        });
    }
    
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
