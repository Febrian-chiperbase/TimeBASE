const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    priority: {
        type: String,
        enum: ['HIGH', 'MEDIUM', 'LOW'],
        default: 'MEDIUM',
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
        default: 'ACTIVE',
        required: true
    },
    category: {
        type: String,
        trim: true,
        maxlength: 50
    },
    estimatedDuration: {
        type: Number,
        required: true,
        min: 1 // minimal 1 menit
    },
    actualDuration: {
        type: Number,
        min: 0
    },
    dueDate: {
        type: Date,
        index: true
    },
    scheduledTime: {
        type: Date
    },
    isCompleted: {
        type: Boolean,
        default: false,
        index: true
    },
    completedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    difficultyLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
    },
    energyRequired: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 30
    }],
    aiSuggestions: {
        type: String, // JSON string untuk AI suggestions
        default: null
    },
    // Metadata untuk tracking dan analytics
    metadata: {
        timeSpentThinking: Number, // waktu yang dihabiskan untuk memikirkan tugas
        postponeCount: { type: Number, default: 0 }, // berapa kali tugas ditunda
        priorityChanges: { type: Number, default: 0 }, // berapa kali prioritas diubah
        estimationAccuracy: Number // akurasi estimasi waktu (actual/estimated)
    }
}, {
    timestamps: true, // otomatis menambah createdAt dan updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes untuk optimasi query
taskSchema.index({ userId: 1, status: 1, isCompleted: 1 });
taskSchema.index({ userId: 1, priority: 1, dueDate: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

// Virtual untuk menghitung skor prioritas
taskSchema.virtual('priorityScore').get(function() {
    const scores = { HIGH: 70, MEDIUM: 35, LOW: 10 };
    return scores[this.priority] || 0;
});

// Virtual untuk menghitung skor kedesakan
taskSchema.virtual('urgencyScore').get(function() {
    if (!this.dueDate) return 0;
    
    const now = new Date();
    const diffInDays = Math.ceil((this.dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 0) return 30; // Deadline hari ini atau sudah lewat
    if (diffInDays === 1) return 20; // Deadline besok
    if (diffInDays <= 7) return 10; // Deadline dalam seminggu
    return 5; // Deadline lebih dari seminggu
});

// Virtual untuk total skor
taskSchema.virtual('totalScore').get(function() {
    return this.priorityScore + this.urgencyScore;
});

// Virtual untuk status kedesakan
taskSchema.virtual('urgencyStatus').get(function() {
    if (!this.dueDate) return 'NO_DEADLINE';
    
    const now = new Date();
    const diffInDays = Math.ceil((this.dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return 'OVERDUE';
    if (diffInDays === 0) return 'DUE_TODAY';
    if (diffInDays === 1) return 'DUE_TOMORROW';
    if (diffInDays <= 7) return 'DUE_THIS_WEEK';
    return 'DUE_LATER';
});

// Virtual untuk estimasi akurasi
taskSchema.virtual('estimationAccuracy').get(function() {
    if (!this.actualDuration || !this.estimatedDuration) return null;
    return Math.round((this.actualDuration / this.estimatedDuration) * 100) / 100;
});

// Pre-save middleware untuk update timestamp
taskSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Update completion timestamp jika tugas selesai
    if (this.isCompleted && !this.completedAt) {
        this.completedAt = new Date();
        this.status = 'COMPLETED';
    }
    
    // Hitung akurasi estimasi jika tugas selesai
    if (this.isCompleted && this.actualDuration && this.estimatedDuration) {
        this.metadata = this.metadata || {};
        this.metadata.estimationAccuracy = this.actualDuration / this.estimatedDuration;
    }
    
    next();
});

// Pre-update middleware
taskSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

// Static method untuk mendapatkan tugas berdasarkan scoring
taskSchema.statics.getRecommendedTasks = function(userId, limit = 10) {
    return this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                status: 'ACTIVE',
                isCompleted: false
            }
        },
        {
            $addFields: {
                priorityScore: {
                    $switch: {
                        branches: [
                            { case: { $eq: ['$priority', 'HIGH'] }, then: 70 },
                            { case: { $eq: ['$priority', 'MEDIUM'] }, then: 35 },
                            { case: { $eq: ['$priority', 'LOW'] }, then: 10 }
                        ],
                        default: 0
                    }
                },
                urgencyScore: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $lte: [
                                        { $divide: [{ $subtract: ['$dueDate', new Date()] }, 86400000] },
                                        0
                                    ]
                                },
                                then: 30
                            },
                            {
                                case: {
                                    $eq: [
                                        { $floor: { $divide: [{ $subtract: ['$dueDate', new Date()] }, 86400000] } },
                                        1
                                    ]
                                },
                                then: 20
                            },
                            {
                                case: {
                                    $lte: [
                                        { $divide: [{ $subtract: ['$dueDate', new Date()] }, 86400000] },
                                        7
                                    ]
                                },
                                then: 10
                            }
                        ],
                        default: 5
                    }
                }
            }
        },
        {
            $addFields: {
                totalScore: { $add: ['$priorityScore', '$urgencyScore'] }
            }
        },
        {
            $sort: {
                totalScore: -1,
                estimatedDuration: 1
            }
        },
        {
            $limit: limit
        }
    ]);
};

// Instance method untuk menghitung skor
taskSchema.methods.calculateScore = function() {
    return {
        priorityScore: this.priorityScore,
        urgencyScore: this.urgencyScore,
        totalScore: this.totalScore,
        reasoning: this.getScoreReasoning()
    };
};

// Instance method untuk penjelasan scoring
taskSchema.methods.getScoreReasoning = function() {
    let reasoning = `Prioritas ${this.priority.toLowerCase()}: ${this.priorityScore} poin`;
    
    if (this.dueDate) {
        const now = new Date();
        const diffInDays = Math.ceil((this.dueDate - now) / (1000 * 60 * 60 * 24));
        let deadlineText;
        
        if (diffInDays <= 0) deadlineText = 'hari ini';
        else if (diffInDays === 1) deadlineText = 'besok';
        else if (diffInDays <= 7) deadlineText = `dalam ${diffInDays} hari`;
        else deadlineText = 'lebih dari seminggu';
        
        reasoning += `, Kedesakan (${deadlineText}): ${this.urgencyScore} poin`;
    }
    
    reasoning += ` = Total: ${this.totalScore} poin`;
    return reasoning;
};

module.exports = mongoose.model('Task', taskSchema);
