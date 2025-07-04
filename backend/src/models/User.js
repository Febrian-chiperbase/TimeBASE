const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    preferences: {
        workingHours: {
            type: [Number],
            default: [9, 17]
        },
        timezone: {
            type: String,
            default: 'Asia/Jakarta'
        },
        breakDuration: {
            type: Number,
            default: 15
        },
        maxContinuousWork: {
            type: Number,
            default: 90
        },
        preferredTaskOrder: {
            type: String,
            enum: ['priority', 'duration', 'difficulty'],
            default: 'priority'
        },
        notificationSettings: {
            taskReminders: { type: Boolean, default: true },
            breakReminders: { type: Boolean, default: true },
            dailySummary: { type: Boolean, default: true }
        }
    },
    aiProfile: {
        workPatterns: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        productivityMetrics: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        learningData: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);
