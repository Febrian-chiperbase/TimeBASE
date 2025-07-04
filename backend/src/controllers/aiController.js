const OpenAI = require('openai');
const aiService = require('../services/aiService');
const Task = require('../models/Task');
const User = require('../models/User');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class AIController {
    
    // Optimasi jadwal harian menggunakan AI
    async optimizeSchedule(req, res) {
        try {
            const { tasks, preferences } = req.body;
            const userId = req.user.id;
            
            // Dapatkan data historis user
            const user = await User.findById(userId);
            const historicalTasks = await Task.find({ 
                userId, 
                isCompleted: true,
                completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 hari terakhir
            });
            
            // Analisis pola kerja user
            const workPatterns = await aiService.analyzeUserWorkPatterns(historicalTasks);
            
            // Generate prompt untuk AI
            const prompt = aiService.generateScheduleOptimizationPrompt(
                tasks, 
                preferences, 
                workPatterns,
                user.timezone
            );
            
            // Panggil OpenAI API
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI productivity assistant specialized in optimizing daily schedules. Analyze the user's tasks, preferences, and work patterns to create an optimal schedule."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });
            
            // Parse response dari AI
            const aiResponse = JSON.parse(completion.choices[0].message.content);
            
            // Proses dan validasi hasil optimasi
            const optimizedSchedule = await aiService.processOptimizedSchedule(
                aiResponse,
                tasks,
                preferences
            );
            
            res.json({
                success: true,
                data: {
                    optimizedTasks: optimizedSchedule.tasks,
                    totalEstimatedTime: optimizedSchedule.totalTime,
                    suggestions: optimizedSchedule.suggestions,
                    confidence: optimizedSchedule.confidence
                }
            });
            
        } catch (error) {
            console.error('Schedule optimization error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to optimize schedule',
                message: error.message
            });
        }
    }
    
    // Mendapatkan saran untuk tugas spesifik
    async getTaskSuggestions(req, res) {
        try {
            const { task, historicalTasks } = req.body;
            const userId = req.user.id;
            
            // Analisis tugas serupa dari riwayat
            const similarTasks = aiService.findSimilarTasks(task, historicalTasks);
            
            // Generate insights dari tugas serupa
            const taskInsights = await aiService.generateTaskInsights(similarTasks);
            
            const prompt = `
                Analyze this task and provide suggestions:
                Task: ${JSON.stringify(task)}
                Similar completed tasks: ${JSON.stringify(similarTasks)}
                Task insights: ${JSON.stringify(taskInsights)}
                
                Provide suggestions for:
                1. Optimal time to work on this task
                2. Estimated duration based on similar tasks
                3. Break recommendations
                4. Preparation tips
                5. Focus strategies
                
                Return response in JSON format.
            `;
            
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI task optimization assistant. Provide practical, actionable suggestions for task completion."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.6,
                max_tokens: 1500
            });
            
            const suggestions = JSON.parse(completion.choices[0].message.content);
            
            res.json({
                success: true,
                data: {
                    suggestion: suggestions,
                    confidence: aiService.calculateSuggestionConfidence(similarTasks.length)
                }
            });
            
        } catch (error) {
            console.error('Task suggestions error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get task suggestions',
                message: error.message
            });
        }
    }
    
    // Analisis produktivitas dan insights
    async getProductivityInsights(req, res) {
        try {
            const { completedTasks, timeRange } = req.body;
            const userId = req.user.id;
            
            // Hitung metrics produktivitas
            const productivityMetrics = aiService.calculateProductivityMetrics(completedTasks);
            
            // Analisis tren dan pola
            const trends = aiService.analyzeTrends(completedTasks, timeRange);
            
            // Generate insights menggunakan AI
            const prompt = `
                Analyze this productivity data and provide insights:
                Metrics: ${JSON.stringify(productivityMetrics)}
                Trends: ${JSON.stringify(trends)}
                Time Range: ${JSON.stringify(timeRange)}
                
                Provide:
                1. Overall productivity score (0-100)
                2. Key trends and patterns
                3. Specific recommendations for improvement
                4. Best performing categories
                5. Areas that need attention
                
                Return response in JSON format.
            `;
            
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI productivity analyst. Provide data-driven insights and actionable recommendations."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.5,
                max_tokens: 2000
            });
            
            const insights = JSON.parse(completion.choices[0].message.content);
            
            res.json({
                success: true,
                data: {
                    insights: insights,
                    rawMetrics: productivityMetrics,
                    trends: trends
                }
            });
            
        } catch (error) {
            console.error('Productivity insights error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get productivity insights',
                message: error.message
            });
        }
    }
    
    // Prediksi durasi tugas
    async predictTaskDuration(req, res) {
        try {
            const { task, similarTasks } = req.body;
            
            // Analisis durasi dari tugas serupa
            const durationAnalysis = aiService.analyzeDurationPatterns(similarTasks);
            
            // Machine learning prediction
            const predictedDuration = await aiService.predictDuration(task, durationAnalysis);
            
            res.json({
                success: true,
                data: {
                    predictedDuration: predictedDuration.duration,
                    confidence: predictedDuration.confidence,
                    factors: predictedDuration.factors,
                    range: predictedDuration.range
                }
            });
            
        } catch (error) {
            console.error('Duration prediction error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to predict task duration',
                message: error.message
            });
        }
    }
    
    // Rekomendasi waktu istirahat
    async getBreakRecommendations(req, res) {
        try {
            const { workSession, userPreferences } = req.body;
            
            // Analisis pola kerja dan kelelahan
            const fatigueAnalysis = aiService.analyzeFatigueLevel(workSession);
            
            // Generate rekomendasi istirahat
            const breakRecommendations = await aiService.generateBreakRecommendations(
                fatigueAnalysis,
                userPreferences
            );
            
            res.json({
                success: true,
                data: breakRecommendations
            });
            
        } catch (error) {
            console.error('Break recommendations error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get break recommendations',
                message: error.message
            });
        }
    }
    
    // Analisis pola kerja user
    async analyzeWorkPatterns(req, res) {
        try {
            const userId = req.params.userId;
            
            // Validasi akses user
            if (userId !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }
            
            // Ambil data historis
            const historicalData = await Task.find({
                userId,
                isCompleted: true,
                completedAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // 90 hari
            });
            
            // Analisis pola kerja
            const workPatterns = await aiService.analyzeUserWorkPatterns(historicalData);
            
            res.json({
                success: true,
                data: workPatterns
            });
            
        } catch (error) {
            console.error('Work patterns analysis error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to analyze work patterns',
                message: error.message
            });
        }
    }
    
    // Tips peningkatan produktivitas
    async getProductivityTips(req, res) {
        try {
            const { userMetrics, goals } = req.body;
            
            // Generate tips personal menggunakan AI
            const prompt = `
                Based on user metrics and goals, provide personalized productivity tips:
                User Metrics: ${JSON.stringify(userMetrics)}
                Goals: ${JSON.stringify(goals)}
                
                Provide 5-7 specific, actionable tips that are:
                1. Personalized to the user's patterns
                2. Achievable and practical
                3. Focused on their specific goals
                4. Based on productivity science
                
                Return response in JSON format with tips array.
            `;
            
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI productivity coach. Provide personalized, science-based productivity advice."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500
            });
            
            const tips = JSON.parse(completion.choices[0].message.content);
            
            res.json({
                success: true,
                data: tips
            });
            
        } catch (error) {
            console.error('Productivity tips error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get productivity tips',
                message: error.message
            });
        }
    }
    
    // Prediksi mood dan energi
    async predictMoodAndEnergy(req, res) {
        try {
            const { historicalData, currentContext } = req.body;
            
            // Analisis pola mood dan energi
            const moodEnergyPatterns = aiService.analyzeMoodEnergyPatterns(historicalData);
            
            // Prediksi berdasarkan konteks saat ini
            const prediction = await aiService.predictMoodAndEnergy(
                moodEnergyPatterns,
                currentContext
            );
            
            res.json({
                success: true,
                data: prediction
            });
            
        } catch (error) {
            console.error('Mood energy prediction error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to predict mood and energy',
                message: error.message
            });
        }
    }
    
    // Optimasi kategori tugas
    async optimizeTaskCategories(req, res) {
        try {
            const { tasks, userBehavior } = req.body;
            
            // Analisis kategori yang ada
            const categoryAnalysis = aiService.analyzeCategoryEffectiveness(tasks, userBehavior);
            
            // Generate saran optimasi kategori
            const optimizedCategories = await aiService.optimizeCategories(categoryAnalysis);
            
            res.json({
                success: true,
                data: optimizedCategories
            });
            
        } catch (error) {
            console.error('Category optimization error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to optimize categories',
                message: error.message
            });
        }
    }
    
    // Generate smart notifications
    async generateSmartNotifications(req, res) {
        try {
            const { upcomingTasks, userContext } = req.body;
            
            // Analisis konteks dan prioritas
            const notificationStrategy = await aiService.generateNotificationStrategy(
                upcomingTasks,
                userContext
            );
            
            res.json({
                success: true,
                data: notificationStrategy
            });
            
        } catch (error) {
            console.error('Smart notifications error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate smart notifications',
                message: error.message
            });
        }
    }
}

module.exports = new AIController();
