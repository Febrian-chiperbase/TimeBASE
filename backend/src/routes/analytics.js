const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const moment = require('moment');

// Get productivity stats
router.get('/productivity', auth, async (req, res) => {
    try {
        const { period = 'week', startDate, endDate } = req.query;
        const userId = req.user.id;

        let dateFilter = {};
        const now = moment();

        // Set date range based on period
        switch (period) {
            case 'day':
                dateFilter = {
                    createdAt: {
                        $gte: now.startOf('day').toDate(),
                        $lte: now.endOf('day').toDate()
                    }
                };
                break;
            case 'week':
                dateFilter = {
                    createdAt: {
                        $gte: now.startOf('week').toDate(),
                        $lte: now.endOf('week').toDate()
                    }
                };
                break;
            case 'month':
                dateFilter = {
                    createdAt: {
                        $gte: now.startOf('month').toDate(),
                        $lte: now.endOf('month').toDate()
                    }
                };
                break;
            case 'custom':
                if (startDate && endDate) {
                    dateFilter = {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    };
                }
                break;
        }

        // Get tasks for the period
        const tasks = await Task.find({
            userId,
            ...dateFilter
        });

        const completedTasks = tasks.filter(task => task.isCompleted);
        const totalTasks = tasks.length;
        const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

        // Calculate time metrics
        const totalTimeSpent = completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0);
        const averageTaskDuration = completedTasks.length > 0 ? totalTimeSpent / completedTasks.length : 0;

        // Calculate accuracy
        const tasksWithEstimate = completedTasks.filter(task => task.estimatedDuration && task.actualDuration);
        const accuracyData = tasksWithEstimate.map(task => ({
            estimated: task.estimatedDuration,
            actual: task.actualDuration,
            accuracy: task.actualDuration / task.estimatedDuration
        }));
        const averageAccuracy = accuracyData.length > 0 ? 
            accuracyData.reduce((sum, item) => sum + item.accuracy, 0) / accuracyData.length : 1;

        res.json({
            success: true,
            data: {
                period,
                totalTasks,
                completedTasks: completedTasks.length,
                completionRate: Math.round(completionRate * 100) / 100,
                totalTimeSpent,
                averageTaskDuration: Math.round(averageTaskDuration),
                averageAccuracy: Math.round(averageAccuracy * 100) / 100,
                accuracyData
            }
        });
    } catch (error) {
        console.error('Productivity analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get productivity stats'
        });
    }
});

// Get category performance
router.get('/categories', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const categoryStats = await Task.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: '$category',
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: ['$isCompleted', 1, 0] }
                    },
                    totalTimeSpent: {
                        $sum: { $ifNull: ['$actualDuration', 0] }
                    },
                    averageDuration: {
                        $avg: { $ifNull: ['$actualDuration', 0] }
                    }
                }
            },
            {
                $addFields: {
                    completionRate: {
                        $multiply: [
                            { $divide: ['$completedTasks', '$totalTasks'] },
                            100
                        ]
                    }
                }
            },
            { $sort: { totalTasks: -1 } }
        ]);

        res.json({
            success: true,
            data: categoryStats
        });
    } catch (error) {
        console.error('Category analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get category performance'
        });
    }
});

// Get time tracking stats
router.get('/time-tracking', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get hourly distribution
        const hourlyStats = await Task.aggregate([
            { $match: { userId: userId, isCompleted: true, completedAt: { $exists: true } } },
            {
                $group: {
                    _id: { $hour: '$completedAt' },
                    count: { $sum: 1 },
                    totalDuration: { $sum: { $ifNull: ['$actualDuration', 0] } }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Get daily distribution
        const dailyStats = await Task.aggregate([
            { $match: { userId: userId, isCompleted: true, completedAt: { $exists: true } } },
            {
                $group: {
                    _id: { $dayOfWeek: '$completedAt' },
                    count: { $sum: 1 },
                    totalDuration: { $sum: { $ifNull: ['$actualDuration', 0] } }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Most productive hours
        const mostProductiveHours = hourlyStats
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map(stat => stat._id);

        res.json({
            success: true,
            data: {
                hourlyDistribution: hourlyStats,
                dailyDistribution: dailyStats,
                mostProductiveHours
            }
        });
    } catch (error) {
        console.error('Time tracking analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get time tracking stats'
        });
    }
});

module.exports = router;
