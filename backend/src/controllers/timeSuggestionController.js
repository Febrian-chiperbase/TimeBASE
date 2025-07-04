const TimeSuggestionService = require('../services/timeSuggestionService');
const Task = require('../models/Task');

class TimeSuggestionController {
    
    /**
     * Endpoint untuk mendapatkan saran waktu berdasarkan nama tugas
     */
    async getSuggestion(req, res) {
        try {
            const { taskName } = req.body;
            const userId = req.user.id;
            
            // Validasi input
            if (!taskName || typeof taskName !== 'string' || taskName.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Task name is required and must be a non-empty string'
                });
            }
            
            // Ambil daftar tugas yang sudah selesai dari database
            const completedTasks = await Task.find({
                userId: userId,
                isCompleted: true,
                completedAt: { $exists: true },
                createdAt: { $exists: true }
            }).select('title createdAt completedAt actualDuration category')
              .sort({ completedAt: -1 })
              .limit(100); // Ambil maksimal 100 tugas terakhir
            
            // Panggil service untuk mendapatkan saran
            const suggestion = TimeSuggestionService.sarankanWaktu(
                taskName.trim(),
                completedTasks
            );
            
            // Log untuk analytics (opsional)
            console.log(`Time suggestion requested for: "${taskName}" by user ${userId}`);
            
            res.json({
                success: true,
                data: {
                    taskName: taskName.trim(),
                    suggestion: suggestion,
                    timestamp: new Date().toISOString()
                }
            });
            
        } catch (error) {
            console.error('Get time suggestion error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get time suggestion',
                message: error.message
            });
        }
    }
    
    /**
     * Endpoint untuk mendapatkan saran waktu dengan analisis detail
     */
    async getDetailedSuggestion(req, res) {
        try {
            const { taskName } = req.body;
            const userId = req.user.id;
            
            if (!taskName || typeof taskName !== 'string' || taskName.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Task name is required'
                });
            }
            
            // Ambil tugas selesai dengan informasi lebih lengkap
            const completedTasks = await Task.find({
                userId: userId,
                isCompleted: true,
                completedAt: { $exists: true },
                createdAt: { $exists: true }
            }).select('title createdAt completedAt actualDuration category priority difficultyLevel')
              .sort({ completedAt: -1 })
              .limit(200);
            
            // Dapatkan analisis debug untuk informasi detail
            const debugInfo = TimeSuggestionService.debugAnalisis(
                taskName.trim(),
                completedTasks
            );
            
            res.json({
                success: true,
                data: {
                    taskName: taskName.trim(),
                    suggestion: debugInfo.hasilSaran,
                    analysis: {
                        extractedKeywords: debugInfo.kataKunci,
                        totalCompletedTasks: debugInfo.jumlahTugasSelesai,
                        similarTasksFound: debugInfo.tugasSerupaDetail,
                        matchingProcess: {
                            keywordExtraction: `Extracted ${debugInfo.kataKunci.length} keywords`,
                            similarityScoring: `Found ${debugInfo.tugasSerupaDetail.length} similar tasks`,
                            durationCalculation: debugInfo.hasilSaran.statistik || null
                        }
                    },
                    timestamp: new Date().toISOString()
                }
            });
            
        } catch (error) {
            console.error('Get detailed time suggestion error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get detailed time suggestion',
                message: error.message
            });
        }
    }
    
    /**
     * Endpoint untuk mendapatkan riwayat saran waktu user
     */
    async getSuggestionHistory(req, res) {
        try {
            const userId = req.user.id;
            const { limit = 20, page = 1 } = req.query;
            
            // Dalam implementasi nyata, Anda mungkin ingin menyimpan riwayat saran
            // Untuk sekarang, kita akan memberikan statistik dari tugas yang sudah selesai
            
            const completedTasks = await Task.find({
                userId: userId,
                isCompleted: true,
                actualDuration: { $exists: true }
            }).select('title actualDuration estimatedDuration completedAt category')
              .sort({ completedAt: -1 })
              .limit(parseInt(limit))
              .skip((parseInt(page) - 1) * parseInt(limit));
            
            // Hitung akurasi estimasi
            const accuracyStats = completedTasks.map(task => {
                const accuracy = task.estimatedDuration > 0 ? 
                    (task.actualDuration / task.estimatedDuration) : null;
                return {
                    taskName: task.title,
                    estimated: task.estimatedDuration,
                    actual: task.actualDuration,
                    accuracy: accuracy ? Math.round(accuracy * 100) / 100 : null,
                    completedAt: task.completedAt,
                    category: task.category
                };
            });
            
            const totalTasks = await Task.countDocuments({
                userId: userId,
                isCompleted: true,
                actualDuration: { $exists: true }
            });
            
            res.json({
                success: true,
                data: {
                    history: accuracyStats,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalTasks / parseInt(limit)),
                        totalItems: totalTasks,
                        itemsPerPage: parseInt(limit)
                    },
                    overallStats: this.calculateOverallAccuracy(accuracyStats)
                }
            });
            
        } catch (error) {
            console.error('Get suggestion history error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get suggestion history',
                message: error.message
            });
        }
    }
    
    /**
     * Endpoint untuk feedback saran waktu
     */
    async submitFeedback(req, res) {
        try {
            const { taskName, suggestedTime, actualTime, accepted, feedback } = req.body;
            const userId = req.user.id;
            
            // Validasi input
            if (!taskName || suggestedTime === undefined || actualTime === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Task name, suggested time, and actual time are required'
                });
            }
            
            // Dalam implementasi nyata, Anda mungkin ingin menyimpan feedback ini
            // untuk meningkatkan akurasi algoritma
            
            const feedbackData = {
                userId,
                taskName,
                suggestedTime,
                actualTime,
                accepted: Boolean(accepted),
                feedback: feedback || null,
                accuracy: suggestedTime > 0 ? actualTime / suggestedTime : null,
                timestamp: new Date()
            };
            
            // Log feedback untuk analisis
            console.log('Time suggestion feedback:', feedbackData);
            
            res.json({
                success: true,
                message: 'Feedback submitted successfully',
                data: {
                    accuracy: feedbackData.accuracy ? 
                        Math.round(feedbackData.accuracy * 100) / 100 : null,
                    improvement: this.generateImprovementSuggestion(feedbackData)
                }
            });
            
        } catch (error) {
            console.error('Submit feedback error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to submit feedback',
                message: error.message
            });
        }
    }
    
    /**
     * Helper method untuk menghitung akurasi keseluruhan
     */
    calculateOverallAccuracy(accuracyStats) {
        const validAccuracies = accuracyStats
            .filter(stat => stat.accuracy !== null)
            .map(stat => stat.accuracy);
        
        if (validAccuracies.length === 0) {
            return {
                averageAccuracy: null,
                totalTasks: 0,
                message: 'No accuracy data available'
            };
        }
        
        const averageAccuracy = validAccuracies.reduce((sum, acc) => sum + acc, 0) / validAccuracies.length;
        const overEstimated = validAccuracies.filter(acc => acc > 1.2).length;
        const underEstimated = validAccuracies.filter(acc => acc < 0.8).length;
        const accurate = validAccuracies.filter(acc => acc >= 0.8 && acc <= 1.2).length;
        
        return {
            averageAccuracy: Math.round(averageAccuracy * 100) / 100,
            totalTasks: validAccuracies.length,
            distribution: {
                accurate: accurate,
                overEstimated: overEstimated,
                underEstimated: underEstimated
            },
            accuracyPercentage: Math.round((accurate / validAccuracies.length) * 100)
        };
    }
    
    /**
     * Helper method untuk generate saran perbaikan
     */
    generateImprovementSuggestion(feedbackData) {
        const { accuracy, taskName } = feedbackData;
        
        if (!accuracy) return null;
        
        if (accuracy > 1.5) {
            return `Estimasi untuk tugas "${taskName}" terlalu rendah. Pertimbangkan untuk menambah buffer waktu untuk tugas serupa.`;
        } else if (accuracy < 0.5) {
            return `Estimasi untuk tugas "${taskName}" terlalu tinggi. Tugas serupa mungkin bisa diselesaikan lebih cepat.`;
        } else if (accuracy >= 0.8 && accuracy <= 1.2) {
            return `Estimasi untuk tugas "${taskName}" cukup akurat. Pertahankan pola estimasi ini.`;
        } else {
            return `Estimasi untuk tugas "${taskName}" perlu sedikit penyesuaian untuk akurasi yang lebih baik.`;
        }
    }
}

module.exports = new TimeSuggestionController();
