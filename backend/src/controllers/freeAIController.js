const { FreeAIService, CohereAIService, GeminiAIService } = require('../services/freeAIService');
const Task = require('../models/Task');
const User = require('../models/User');

class FreeAIController {
    
    constructor() {
        // Inisialisasi semua AI services
        this.huggingFace = new FreeAIService();
        this.cohere = new CohereAIService();
        this.gemini = new GeminiAIService();
    }
    
    /**
     * Optimasi jadwal menggunakan AI gratis
     */
    async optimizeSchedule(req, res) {
        try {
            const { tasks, preferences } = req.body;
            const userId = req.user.id;
            
            // Generate prompt untuk AI
            const prompt = this.generateSchedulePrompt(tasks, preferences);
            
            // Coba beberapa AI service secara berurutan (fallback)
            let aiResponse = null;
            
            // 1. Coba Gemini (paling bagus untuk reasoning)
            try {
                aiResponse = await this.gemini.generateContent(prompt);
                console.log('Using Gemini AI');
            } catch (error) {
                console.log('Gemini failed, trying Cohere...');
            }
            
            // 2. Fallback ke Cohere
            if (!aiResponse) {
                try {
                    aiResponse = await this.cohere.generate(prompt);
                    console.log('Using Cohere AI');
                } catch (error) {
                    console.log('Cohere failed, trying Hugging Face...');
                }
            }
            
            // 3. Fallback ke Hugging Face
            if (!aiResponse) {
                try {
                    aiResponse = await this.huggingFace.generateText(prompt);
                    console.log('Using Hugging Face AI');
                } catch (error) {
                    console.log('All AI services failed, using rule-based fallback');
                }
            }
            
            // 4. Fallback ke algoritma rule-based jika semua AI gagal
            if (!aiResponse) {
                const ruleBasedResult = this.ruleBasedScheduleOptimization(tasks, preferences);
                return res.json({
                    success: true,
                    data: ruleBasedResult,
                    aiUsed: 'rule-based-fallback'
                });
            }
            
            // Parse dan process AI response
            const optimizedSchedule = this.parseScheduleResponse(aiResponse, tasks);
            
            res.json({
                success: true,
                data: optimizedSchedule,
                aiUsed: 'free-ai-service'
            });
            
        } catch (error) {
            console.error('Schedule optimization error:', error);
            
            // Fallback ke rule-based jika error
            const ruleBasedResult = this.ruleBasedScheduleOptimization(req.body.tasks, req.body.preferences);
            res.json({
                success: true,
                data: ruleBasedResult,
                aiUsed: 'rule-based-fallback',
                note: 'AI service unavailable, using rule-based optimization'
            });
        }
    }
    
    /**
     * Generate saran produktivitas menggunakan AI gratis
     */
    async getProductivityTips(req, res) {
        try {
            const { userMetrics, goals } = req.body;
            const userId = req.user.id;
            
            const prompt = `
                Berdasarkan data produktivitas berikut, berikan 5 tips untuk meningkatkan produktivitas:
                
                Metrics User:
                - Rata-rata waktu penyelesaian tugas: ${userMetrics.averageTaskDuration} menit
                - Tingkat penyelesaian: ${userMetrics.completionRate}%
                - Jam produktif: ${userMetrics.mostProductiveHours.join(', ')}
                
                Goals:
                ${goals.map(goal => `- ${goal}`).join('\n')}
                
                Berikan tips yang spesifik, actionable, dan personal. Format dalam JSON:
                {
                    "tips": [
                        {
                            "title": "Judul tip",
                            "description": "Penjelasan detail",
                            "priority": "high/medium/low"
                        }
                    ]
                }
            `;
            
            // Coba AI services
            let aiResponse = await this.gemini.generateContent(prompt) ||
                           await this.cohere.generate(prompt) ||
                           await this.huggingFace.generateText(prompt);
            
            if (!aiResponse) {
                // Fallback ke tips rule-based
                const ruleBasedTips = this.generateRuleBasedTips(userMetrics, goals);
                return res.json({
                    success: true,
                    data: ruleBasedTips,
                    aiUsed: 'rule-based'
                });
            }
            
            // Parse AI response
            let tips;
            try {
                tips = JSON.parse(aiResponse);
            } catch (e) {
                // Jika tidak bisa parse JSON, buat struktur manual
                tips = {
                    tips: [{
                        title: "Saran AI",
                        description: aiResponse,
                        priority: "medium"
                    }]
                };
            }
            
            res.json({
                success: true,
                data: tips,
                aiUsed: 'free-ai'
            });
            
        } catch (error) {
            console.error('Productivity tips error:', error);
            
            // Fallback ke rule-based tips
            const ruleBasedTips = this.generateRuleBasedTips(req.body.userMetrics, req.body.goals);
            res.json({
                success: true,
                data: ruleBasedTips,
                aiUsed: 'rule-based-fallback'
            });
        }
    }
    
    /**
     * Analisis mood dan energi menggunakan AI gratis
     */
    async analyzeMoodAndEnergy(req, res) {
        try {
            const { taskHistory, currentContext } = req.body;
            
            // Gunakan sentiment analysis dari Hugging Face
            const recentTasks = taskHistory.slice(-5); // 5 tugas terakhir
            const taskDescriptions = recentTasks.map(task => task.description || task.title).join('. ');
            
            const sentimentResult = await this.huggingFace.analyzeSentiment(taskDescriptions);
            
            let moodPrediction = 'neutral';
            let energyLevel = 'medium';
            
            if (sentimentResult) {
                const sentiment = sentimentResult.label.toLowerCase();
                if (sentiment.includes('positive')) {
                    moodPrediction = 'positive';
                    energyLevel = 'high';
                } else if (sentiment.includes('negative')) {
                    moodPrediction = 'negative';
                    energyLevel = 'low';
                }
            }
            
            // Generate recommendations berdasarkan mood
            const recommendations = this.generateMoodBasedRecommendations(moodPrediction, energyLevel);
            
            res.json({
                success: true,
                data: {
                    moodPrediction,
                    energyLevel,
                    confidence: sentimentResult?.score || 0.5,
                    recommendations,
                    analysis: sentimentResult
                }
            });
            
        } catch (error) {
            console.error('Mood analysis error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to analyze mood and energy'
            });
        }
    }
    
    /**
     * Generate prompt untuk schedule optimization
     */
    generateSchedulePrompt(tasks, preferences) {
        return `
            Optimasi jadwal harian berikut:
            
            TUGAS:
            ${tasks.map(task => `- ${task.title} (${task.estimatedDuration} menit, prioritas: ${task.priority})`).join('\n')}
            
            PREFERENSI:
            - Jam kerja: ${preferences.workingHours[0]}:00 - ${preferences.workingHours[1]}:00
            - Durasi istirahat: ${preferences.breakDuration} menit
            - Maksimal kerja terus-menerus: ${preferences.maxContinuousWork} menit
            
            Berikan jadwal optimal dalam format JSON:
            {
                "schedule": [
                    {
                        "taskId": "id_tugas",
                        "startTime": "HH:MM",
                        "endTime": "HH:MM",
                        "suggestion": "saran khusus"
                    }
                ],
                "totalTime": total_menit,
                "breaks": ["waktu_istirahat"]
            }
        `;
    }
    
    /**
     * Rule-based schedule optimization sebagai fallback
     */
    ruleBasedScheduleOptimization(tasks, preferences) {
        // Urutkan tugas berdasarkan prioritas dan deadline
        const sortedTasks = tasks.sort((a, b) => {
            if (a.priority !== b.priority) {
                const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
        
        const schedule = [];
        let currentTime = preferences.workingHours[0] * 60; // dalam menit dari 00:00
        const endTime = preferences.workingHours[1] * 60;
        
        sortedTasks.forEach(task => {
            if (currentTime + task.estimatedDuration <= endTime) {
                const startHour = Math.floor(currentTime / 60);
                const startMin = currentTime % 60;
                const endTimeTask = currentTime + task.estimatedDuration;
                const endHour = Math.floor(endTimeTask / 60);
                const endMinTask = endTimeTask % 60;
                
                schedule.push({
                    taskId: task.id,
                    taskTitle: task.title,
                    startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
                    endTime: `${endHour.toString().padStart(2, '0')}:${endMinTask.toString().padStart(2, '0')}`,
                    suggestion: `Kerjakan saat energi ${task.priority === 'HIGH' ? 'tinggi' : 'normal'}`
                });
                
                currentTime = endTimeTask + preferences.breakDuration;
            }
        });
        
        return {
            schedule,
            totalTime: schedule.reduce((sum, item) => sum + (item.endTime - item.startTime), 0),
            suggestions: [
                'Mulai dengan tugas prioritas tinggi',
                'Ambil istirahat setiap 90 menit',
                'Sesuaikan dengan tingkat energi Anda'
            ]
        };
    }
    
    /**
     * Generate rule-based productivity tips
     */
    generateRuleBasedTips(userMetrics, goals) {
        const tips = [];
        
        // Analisis completion rate
        if (userMetrics.completionRate < 70) {
            tips.push({
                title: "Tingkatkan Konsistensi",
                description: "Tingkat penyelesaian tugas Anda ${userMetrics.completionRate}%. Coba buat target yang lebih realistis dan pecah tugas besar menjadi bagian kecil.",
                priority: "high"
            });
        }
        
        // Analisis durasi tugas
        if (userMetrics.averageTaskDuration > 120) {
            tips.push({
                title: "Optimalkan Waktu Kerja",
                description: "Rata-rata durasi tugas Anda ${userMetrics.averageTaskDuration} menit. Pertimbangkan teknik Pomodoro untuk meningkatkan fokus.",
                priority: "medium"
            });
        }
        
        // Tips berdasarkan jam produktif
        tips.push({
            title: "Manfaatkan Jam Produktif",
            description: `Jam produktif Anda: ${userMetrics.mostProductiveHours.join(', ')}. Jadwalkan tugas penting di jam-jam ini.`,
            priority: "high"
        });
        
        // Tips umum
        tips.push({
            title: "Istirahat Teratur",
            description: "Ambil istirahat 15 menit setiap 90 menit kerja untuk menjaga produktivitas.",
            priority: "medium"
        });
        
        tips.push({
            title: "Review Harian",
            description: "Lakukan review 10 menit di akhir hari untuk evaluasi dan perencanaan esok hari.",
            priority: "low"
        });
        
        return { tips };
    }
    
    /**
     * Generate mood-based recommendations
     */
    generateMoodBasedRecommendations(mood, energy) {
        const recommendations = [];
        
        if (mood === 'positive' && energy === 'high') {
            recommendations.push('Waktu yang tepat untuk mengerjakan tugas yang menantang');
            recommendations.push('Manfaatkan energi tinggi untuk tugas prioritas');
        } else if (mood === 'negative' || energy === 'low') {
            recommendations.push('Mulai dengan tugas ringan untuk membangun momentum');
            recommendations.push('Pertimbangkan istirahat atau aktivitas yang menyenangkan');
        } else {
            recommendations.push('Fokus pada tugas dengan prioritas medium');
            recommendations.push('Jaga keseimbangan antara kerja dan istirahat');
        }
        
        return recommendations;
    }
    
    /**
     * Parse AI response untuk schedule
     */
    parseScheduleResponse(aiResponse, originalTasks) {
        try {
            const parsed = JSON.parse(aiResponse);
            return parsed;
        } catch (e) {
            // Jika tidak bisa parse, return rule-based result
            return this.ruleBasedScheduleOptimization(originalTasks, { workingHours: [9, 17], breakDuration: 15 });
        }
    }
}

module.exports = new FreeAIController();
