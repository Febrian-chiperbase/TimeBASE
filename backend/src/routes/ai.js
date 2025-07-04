const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Middleware untuk validasi input AI
const validateAIRequest = [
    body('tasks').isArray().withMessage('Tasks must be an array'),
    body('preferences').isObject().withMessage('Preferences must be an object'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        next();
    }
];

// Route untuk optimasi jadwal harian
router.post('/optimize-schedule', auth, validateAIRequest, aiController.optimizeSchedule);

// Route untuk mendapatkan saran tugas
router.post('/task-suggestions', auth, [
    body('task').isObject().withMessage('Task must be an object'),
    body('historicalTasks').isArray().withMessage('Historical tasks must be an array')
], aiController.getTaskSuggestions);

// Route untuk analisis produktivitas
router.post('/productivity-insights', auth, [
    body('completedTasks').isArray().withMessage('Completed tasks must be an array'),
    body('timeRange').isObject().withMessage('Time range must be an object')
], aiController.getProductivityInsights);

// Route untuk prediksi waktu penyelesaian tugas
router.post('/predict-duration', auth, [
    body('task').isObject().withMessage('Task must be an object'),
    body('similarTasks').isArray().withMessage('Similar tasks must be an array')
], aiController.predictTaskDuration);

// Route untuk rekomendasi waktu istirahat
router.post('/break-recommendations', auth, [
    body('workSession').isObject().withMessage('Work session must be an object'),
    body('userPreferences').isObject().withMessage('User preferences must be an object')
], aiController.getBreakRecommendations);

// Route untuk analisis pola kerja
router.get('/work-patterns/:userId', auth, aiController.analyzeWorkPatterns);

// Route untuk saran peningkatan produktivitas
router.post('/productivity-tips', auth, [
    body('userMetrics').isObject().withMessage('User metrics must be an object'),
    body('goals').isArray().withMessage('Goals must be an array')
], aiController.getProductivityTips);

// Route untuk prediksi mood dan energi
router.post('/mood-energy-prediction', auth, [
    body('historicalData').isArray().withMessage('Historical data must be an array'),
    body('currentContext').isObject().withMessage('Current context must be an object')
], aiController.predictMoodAndEnergy);

// Route untuk optimasi kategori tugas
router.post('/optimize-categories', auth, [
    body('tasks').isArray().withMessage('Tasks must be an array'),
    body('userBehavior').isObject().withMessage('User behavior must be an object')
], aiController.optimizeTaskCategories);

// Route untuk smart notifications
router.post('/smart-notifications', auth, [
    body('upcomingTasks').isArray().withMessage('Upcoming tasks must be an array'),
    body('userContext').isObject().withMessage('User context must be an object')
], aiController.generateSmartNotifications);

module.exports = router;
