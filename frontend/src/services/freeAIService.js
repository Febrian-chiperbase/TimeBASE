import axios from 'axios';

/**
 * Service untuk menggunakan Free AI APIs
 */
class FreeAIService {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
        this.token = localStorage.getItem('token');
    }

    /**
     * Get headers dengan authentication
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    /**
     * Optimasi jadwal menggunakan AI gratis
     */
    async optimizeSchedule(tasks, preferences) {
        try {
            const response = await axios.post(
                `${this.baseURL}/free-ai/optimize-schedule`,
                {
                    tasks,
                    preferences
                },
                {
                    headers: this.getHeaders(),
                    timeout: 30000 // 30 seconds timeout
                }
            );

            return {
                success: true,
                data: response.data.data,
                aiUsed: response.data.aiUsed,
                note: response.data.note
            };
        } catch (error) {
            console.error('Schedule optimization error:', error);
            
            if (error.response?.status === 429) {
                throw new Error('Rate limit exceeded. Coba lagi dalam 1 jam.');
            }
            
            throw new Error('Gagal mengoptimalkan jadwal. Menggunakan algoritma backup.');
        }
    }

    /**
     * Mendapatkan tips produktivitas dari AI
     */
    async getProductivityTips(userMetrics, goals) {
        try {
            const response = await axios.post(
                `${this.baseURL}/free-ai/productivity-tips`,
                {
                    userMetrics,
                    goals
                },
                {
                    headers: this.getHeaders(),
                    timeout: 20000
                }
            );

            return {
                success: true,
                tips: response.data.data.tips,
                aiUsed: response.data.aiUsed
            };
        } catch (error) {
            console.error('Productivity tips error:', error);
            
            // Fallback tips jika AI gagal
            return {
                success: true,
                tips: this.getFallbackTips(userMetrics),
                aiUsed: 'fallback'
            };
        }
    }

    /**
     * Analisis mood dan energi
     */
    async analyzeMoodAndEnergy(taskHistory, currentContext) {
        try {
            const response = await axios.post(
                `${this.baseURL}/free-ai/mood-analysis`,
                {
                    taskHistory,
                    currentContext
                },
                {
                    headers: this.getHeaders(),
                    timeout: 15000
                }
            );

            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Mood analysis error:', error);
            
            // Fallback mood analysis
            return {
                success: true,
                data: {
                    moodPrediction: 'neutral',
                    energyLevel: 'medium',
                    confidence: 0.5,
                    recommendations: [
                        'Mulai dengan tugas yang mudah',
                        'Ambil istirahat jika diperlukan'
                    ]
                },
                aiUsed: 'fallback'
            };
        }
    }

    /**
     * Check status AI services
     */
    async getAIStatus() {
        try {
            const response = await axios.get(
                `${this.baseURL}/free-ai/status`,
                {
                    headers: this.getHeaders()
                }
            );

            return response.data.data;
        } catch (error) {
            console.error('AI status error:', error);
            return null;
        }
    }

    /**
     * Fallback tips jika AI tidak tersedia
     */
    getFallbackTips(userMetrics) {
        const tips = [];

        if (userMetrics.completionRate < 70) {
            tips.push({
                title: "Tingkatkan Konsistensi",
                description: `Tingkat penyelesaian tugas Anda ${userMetrics.completionRate}%. Coba buat target yang lebih realistis.`,
                priority: "high"
            });
        }

        if (userMetrics.averageTaskDuration > 120) {
            tips.push({
                title: "Optimalkan Waktu",
                description: "Gunakan teknik Pomodoro untuk meningkatkan fokus dan efisiensi.",
                priority: "medium"
            });
        }

        tips.push({
            title: "Manfaatkan Jam Produktif",
            description: `Jadwalkan tugas penting di jam ${userMetrics.mostProductiveHours?.join(', ') || '9-11'}.`,
            priority: "high"
        });

        tips.push({
            title: "Istirahat Teratur",
            description: "Ambil istirahat 15 menit setiap 90 menit untuk menjaga produktivitas.",
            priority: "medium"
        });

        return tips;
    }

    /**
     * Retry mechanism dengan exponential backoff
     */
    async retryRequest(requestFn, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await requestFn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                
                const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}

export default new FreeAIService();
