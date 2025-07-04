const moment = require('moment');

const moment = require('moment');

/**
 * Service untuk menghitung skor dan rekomendasi tugas
 * Berdasarkan aturan: 70% Prioritas + 30% Kedesakan
 */
class TaskScoringService {
    
    /**
     * Konstanta untuk scoring
     */
    static PRIORITY_SCORES = {
        HIGH: 70,
        MEDIUM: 35,
        LOW: 10
    };
    
    static URGENCY_SCORES = {
        TODAY: 30,      // Deadline hari ini
        TOMORROW: 20,   // Deadline besok
        WEEK: 10,       // Deadline dalam seminggu
        LATER: 5        // Deadline lebih dari seminggu
    };
    
    /**
     * Menghitung skor kedesakan berdasarkan deadline
     */
    static calculateUrgencyScore(dueDate) {
        if (!dueDate) return 0;
        
        const now = moment();
        const due = moment(dueDate);
        const diffInDays = due.diff(now, 'days');
        
        if (diffInDays <= 0) {
            return this.URGENCY_SCORES.TODAY;  // Deadline hari ini atau sudah lewat
        } else if (diffInDays === 1) {
            return this.URGENCY_SCORES.TOMORROW;  // Deadline besok
        } else if (diffInDays <= 7) {
            return this.URGENCY_SCORES.WEEK;  // Deadline dalam seminggu
        } else {
            return this.URGENCY_SCORES.LATER;  // Deadline lebih dari seminggu
        }
    }
    
    /**
     * Menghitung total skor tugas
     */
    static calculateTaskScore(task) {
        const priorityScore = this.PRIORITY_SCORES[task.priority] || 0;
        const urgencyScore = this.calculateUrgencyScore(task.dueDate);
        const totalScore = priorityScore + urgencyScore;
        
        const reasoning = this.generateScoreReasoning(task, priorityScore, urgencyScore);
        
        return {
            taskId: task._id || task.id,
            taskTitle: task.title,
            priorityScore,
            urgencyScore,
            totalScore,
            estimatedDuration: task.estimatedDuration,
            reasoning,
            recommendation: this.getRecommendationLevel(totalScore)
        };
    }
    
    /**
     * Mendapatkan rekomendasi tugas berdasarkan aturan scoring
     */
    static getRecommendedTasks(tasks) {
        // Filter hanya tugas yang aktif dan tidak ditunda
        const activeTasks = tasks.filter(task => 
            task.status === 'ACTIVE' && !task.isCompleted
        );
        
        // Hitung skor untuk setiap tugas
        const taskScores = activeTasks.map(task => 
            this.calculateTaskScore(task)
        );
        
        // Urutkan berdasarkan:
        // 1. Total skor tertinggi
        // 2. Jika skor sama, estimasi waktu tercepat
        return taskScores.sort((a, b) => {
            if (b.totalScore !== a.totalScore) {
                return b.totalScore - a.totalScore;
            }
            return a.estimatedDuration - b.estimatedDuration;
        });
    }
    
    /**
     * Mendapatkan tugas dengan prioritas tertinggi
     */
    static getTopRecommendedTask(tasks) {
        const recommendedTasks = this.getRecommendedTasks(tasks);
        return recommendedTasks.length > 0 ? recommendedTasks[0] : null;
    }
    
    /**
     * Generate penjelasan scoring
     */
    static generateScoreReasoning(task, priorityScore, urgencyScore) {
        let reasoning = `Prioritas ${task.priority.toLowerCase()}: ${priorityScore} poin`;
        
        if (task.dueDate) {
            const daysUntilDue = moment(task.dueDate).diff(moment(), 'days');
            const deadlineText = this.formatDeadline(daysUntilDue);
            reasoning += `, Kedesakan (${deadlineText}): ${urgencyScore} poin`;
        }
        
        reasoning += ` = Total: ${priorityScore + urgencyScore} poin`;
        return reasoning;
    }
    
    /**
     * Format deadline untuk display
     */
    static formatDeadline(daysUntilDue) {
        if (daysUntilDue <= 0) return 'hari ini';
        if (daysUntilDue === 1) return 'besok';
        if (daysUntilDue <= 7) return `dalam ${daysUntilDue} hari`;
        return 'lebih dari seminggu';
    }
    
    /**
     * Mendapatkan level rekomendasi berdasarkan skor
     */
    static getRecommendationLevel(totalScore) {
        if (totalScore >= 90) return 'Sangat Direkomendasikan';
        if (totalScore >= 60) return 'Direkomendasikan';
        if (totalScore >= 30) return 'Pertimbangkan';
        return 'Prioritas Rendah';
    }
    
    /**
     * Mendapatkan detail scoring untuk UI
     */
    static getDetailedScoring(task) {
        const taskScore = this.calculateTaskScore(task);
        const daysUntilDue = task.dueDate ? 
            moment(task.dueDate).diff(moment(), 'days') : null;
        
        return {
            taskId: task._id || task.id,
            taskTitle: task.title,
            priority: {
                level: task.priority,
                score: taskScore.priorityScore,
                weight: '70%'
            },
            urgency: {
                daysUntilDue,
                score: taskScore.urgencyScore,
                weight: '30%'
            },
            totalScore: taskScore.totalScore,
            estimatedDuration: task.estimatedDuration,
            reasoning: taskScore.reasoning,
            recommendation: taskScore.recommendation,
            scoringBreakdown: {
                priorityContribution: (taskScore.priorityScore / taskScore.totalScore * 100).toFixed(1) + '%',
                urgencyContribution: (taskScore.urgencyScore / taskScore.totalScore * 100).toFixed(1) + '%'
            }
        };
    }
    
    /**
     * Mendapatkan statistik rekomendasi
     */
    static getRecommendationStats(tasks) {
        const activeTasks = tasks.filter(task => 
            task.status === 'ACTIVE' && !task.isCompleted
        );
        
        const taskScores = activeTasks.map(task => 
            this.calculateTaskScore(task)
        );
        
        const highPriorityTasks = activeTasks.filter(task => 
            task.priority === 'HIGH'
        ).length;
        
        const urgentTasks = taskScores.filter(score => 
            score.urgencyScore >= 20
        ).length;
        
        const averageScore = taskScores.length > 0 ? 
            taskScores.reduce((sum, score) => sum + score.totalScore, 0) / taskScores.length : 0;
        
        return {
            totalActiveTasks: activeTasks.length,
            highPriorityTasks,
            urgentTasks,
            averageScore: Math.round(averageScore * 100) / 100,
            recommendedTasksCount: taskScores.length,
            scoreDistribution: {
                veryHigh: taskScores.filter(s => s.totalScore >= 90).length,
                high: taskScores.filter(s => s.totalScore >= 60 && s.totalScore < 90).length,
                medium: taskScores.filter(s => s.totalScore >= 30 && s.totalScore < 60).length,
                low: taskScores.filter(s => s.totalScore < 30).length
            }
        };
    }
    
    /**
     * Validasi aturan scoring
     */
    static validateScoringRules(tasks) {
        const errors = [];
        
        tasks.forEach(task => {
            // Validasi prioritas
            if (!['HIGH', 'MEDIUM', 'LOW'].includes(task.priority)) {
                errors.push(`Task ${task.title}: Invalid priority ${task.priority}`);
            }
            
            // Validasi status
            if (!['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].includes(task.status)) {
                errors.push(`Task ${task.title}: Invalid status ${task.status}`);
            }
            
            // Validasi estimasi waktu
            if (!task.estimatedDuration || task.estimatedDuration <= 0) {
                errors.push(`Task ${task.title}: Invalid estimated duration`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Simulasi perubahan skor jika prioritas atau deadline diubah
     */
    static simulateScoreChange(task, newPriority, newDueDate) {
        const originalScore = this.calculateTaskScore(task);
        
        const modifiedTask = {
            ...task,
            priority: newPriority || task.priority,
            dueDate: newDueDate || task.dueDate
        };
        
        const newScore = this.calculateTaskScore(modifiedTask);
        
        return {
            original: originalScore,
            modified: newScore,
            scoreDifference: newScore.totalScore - originalScore.totalScore,
            impact: this.getScoreChangeImpact(newScore.totalScore - originalScore.totalScore)
        };
    }
    
    /**
     * Mendapatkan dampak perubahan skor
     */
    static getScoreChangeImpact(scoreDifference) {
        if (scoreDifference > 30) return 'Peningkatan Signifikan';
        if (scoreDifference > 10) return 'Peningkatan Sedang';
        if (scoreDifference > 0) return 'Peningkatan Kecil';
        if (scoreDifference === 0) return 'Tidak Ada Perubahan';
        if (scoreDifference > -10) return 'Penurunan Kecil';
        if (scoreDifference > -30) return 'Penurunan Sedang';
        return 'Penurunan Signifikan';
    }
}

module.exports = TaskScoringService;
