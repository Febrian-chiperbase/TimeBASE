const Task = require('../models/Task');
const TaskScoringService = require('../services/taskScoringService');

class TaskController {
    
    /**
     * Mendapatkan semua tugas dengan opsi filter
     */
    async getAllTasks(req, res) {
        try {
            const { status, category, priority, page = 1, limit = 20 } = req.query;
            const userId = req.user.id;
            
            // Build filter query
            const filter = { userId };
            if (status) filter.status = status.toUpperCase();
            if (category) filter.category = category;
            if (priority) filter.priority = priority.toUpperCase();
            
            // Pagination
            const skip = (page - 1) * limit;
            
            const tasks = await Task.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
            
            const total = await Task.countDocuments(filter);
            
            res.json({
                success: true,
                data: {
                    tasks,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / limit),
                        totalItems: total,
                        itemsPerPage: parseInt(limit)
                    }
                }
            });
            
        } catch (error) {
            console.error('Get all tasks error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tasks',
                message: error.message
            });
        }
    }
    
    /**
     * Mendapatkan rekomendasi tugas berdasarkan scoring logic
     */
    async getRecommendedTasks(req, res) {
        try {
            const userId = req.user.id;
            const { limit = 10 } = req.query;
            
            // Ambil semua tugas user
            const allTasks = await Task.find({ userId });
            
            // Validasi aturan scoring
            const validation = TaskScoringService.validateScoringRules(allTasks);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid task data for scoring',
                    details: validation.errors
                });
            }
            
            // Hitung rekomendasi menggunakan scoring service
            const recommendedTasks = TaskScoringService.getRecommendedTasks(allTasks);
            const topTask = TaskScoringService.getTopRecommendedTask(allTasks);
            const stats = TaskScoringService.getRecommendationStats(allTasks);
            
            // Limit hasil jika diminta
            const limitedRecommendations = limit ? 
                recommendedTasks.slice(0, parseInt(limit)) : 
                recommendedTasks;
            
            res.json({
                success: true,
                data: {
                    recommendedTasks: limitedRecommendations,
                    topRecommendedTask: topTask,
                    statistics: stats,
                    scoringRules: {
                        priorityWeight: '70%',
                        urgencyWeight: '30%',
                        tieBreaker: 'Estimasi waktu tercepat'
                    }
                }
            });
            
        } catch (error) {
            console.error('Get recommended tasks error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get task recommendations',
                message: error.message
            });
        }
    }
    
    /**
     * Mendapatkan detail scoring untuk tugas tertentu
     */
    async getTaskScoringDetails(req, res) {
        try {
            const { taskId } = req.params;
            const userId = req.user.id;
            
            const task = await Task.findOne({ _id: taskId, userId });
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }
            
            const scoringDetails = TaskScoringService.getDetailedScoring(task);
            
            res.json({
                success: true,
                data: scoringDetails
            });
            
        } catch (error) {
            console.error('Get task scoring details error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get task scoring details',
                message: error.message
            });
        }
    }
    
    /**
     * Membuat tugas baru
     */
    async createTask(req, res) {
        try {
            const userId = req.user.id;
            const taskData = {
                ...req.body,
                userId,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const task = new Task(taskData);
            await task.save();
            
            // Hitung skor untuk tugas baru
            const taskScore = TaskScoringService.calculateTaskScore(task);
            
            res.status(201).json({
                success: true,
                data: {
                    task,
                    scoring: taskScore
                }
            });
            
        } catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create task',
                message: error.message
            });
        }
    }
    
    /**
     * Memperbarui tugas
     */
    async updateTask(req, res) {
        try {
            const { taskId } = req.params;
            const userId = req.user.id;
            const updateData = {
                ...req.body,
                updatedAt: new Date()
            };
            
            const task = await Task.findOneAndUpdate(
                { _id: taskId, userId },
                updateData,
                { new: true }
            );
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }
            
            // Hitung skor baru setelah update
            const taskScore = TaskScoringService.calculateTaskScore(task);
            
            res.json({
                success: true,
                data: {
                    task,
                    scoring: taskScore
                }
            });
            
        } catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update task',
                message: error.message
            });
        }
    }
    
    /**
     * Menghapus tugas
     */
    async deleteTask(req, res) {
        try {
            const { taskId } = req.params;
            const userId = req.user.id;
            
            const task = await Task.findOneAndDelete({ _id: taskId, userId });
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Task deleted successfully'
            });
            
        } catch (error) {
            console.error('Delete task error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete task',
                message: error.message
            });
        }
    }
    
    /**
     * Menandai tugas sebagai selesai
     */
    async completeTask(req, res) {
        try {
            const { taskId } = req.params;
            const { actualDuration } = req.body;
            const userId = req.user.id;
            
            const task = await Task.findOneAndUpdate(
                { _id: taskId, userId },
                {
                    isCompleted: true,
                    status: 'COMPLETED',
                    actualDuration: actualDuration || undefined,
                    completedAt: new Date(),
                    updatedAt: new Date()
                },
                { new: true }
            );
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }
            
            res.json({
                success: true,
                data: task,
                message: 'Task completed successfully'
            });
            
        } catch (error) {
            console.error('Complete task error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to complete task',
                message: error.message
            });
        }
    }
    
    /**
     * Mengubah status tugas (pause/resume/cancel)
     */
    async updateTaskStatus(req, res) {
        try {
            const { taskId } = req.params;
            const { status } = req.body;
            const userId = req.user.id;
            
            if (!['ACTIVE', 'PAUSED', 'CANCELLED'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid status',
                    message: 'Status must be ACTIVE, PAUSED, or CANCELLED'
                });
            }
            
            const task = await Task.findOneAndUpdate(
                { _id: taskId, userId },
                {
                    status,
                    updatedAt: new Date()
                },
                { new: true }
            );
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }
            
            res.json({
                success: true,
                data: task,
                message: `Task status updated to ${status}`
            });
            
        } catch (error) {
            console.error('Update task status error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update task status',
                message: error.message
            });
        }
    }
    
    /**
     * Simulasi perubahan skor
     */
    async simulateScoreChange(req, res) {
        try {
            const { taskId } = req.params;
            const { newPriority, newDueDate } = req.body;
            const userId = req.user.id;
            
            const task = await Task.findOne({ _id: taskId, userId });
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }
            
            const simulation = TaskScoringService.simulateScoreChange(
                task.toObject(),
                newPriority,
                newDueDate
            );
            
            res.json({
                success: true,
                data: simulation
            });
            
        } catch (error) {
            console.error('Simulate score change error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to simulate score change',
                message: error.message
            });
        }
    }
    
    /**
     * Mendapatkan statistik tugas
     */
    async getTaskStatistics(req, res) {
        try {
            const userId = req.user.id;
            
            const allTasks = await Task.find({ userId });
            const stats = TaskScoringService.getRecommendationStats(allTasks);
            
            // Tambahan statistik
            const completedTasks = allTasks.filter(task => task.isCompleted);
            const averageCompletionTime = completedTasks.length > 0 ?
                completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0) / completedTasks.length :
                0;
            
            const extendedStats = {
                ...stats,
                completedTasksCount: completedTasks.length,
                averageCompletionTime: Math.round(averageCompletionTime),
                completionRate: allTasks.length > 0 ? 
                    (completedTasks.length / allTasks.length * 100).toFixed(1) + '%' : '0%'
            };
            
            res.json({
                success: true,
                data: extendedStats
            });
            
        } catch (error) {
            console.error('Get task statistics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get task statistics',
                message: error.message
            });
        }
    }
}

module.exports = new TaskController();
