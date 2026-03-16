const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currentStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    longestStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    lastCompletedDate: {
        type: Date,
        default: null
    },
    streakHistory: [{
        date: {
            type: Date,
            required: true
        },
        todosCompleted: {
            type: Number,
            default: 0,
            min: 0
        },
        todosAdded: {
            type: Number,
            default: 0,
            min: 0
        },
        streakMaintained: {
            type: Boolean,
            default: false
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});



// Static method to get or create streak
streakSchema.statics.getOrCreateStreak = async function(userId) {
    try {
        let streak = await this.findOne({ userId });
        
        if (!streak) {
            streak = new this({
                userId,
                currentStreak: 0,
                longestStreak: 0,
                lastCompletedDate: null,
                streakHistory: [],
                isActive: true,
                startDate: new Date()
            });
            await streak.save();
        }
        
        return streak;
    } catch (error) {
        throw new Error(`Error getting/creating streak: ${error.message}`);
    }
};

// Instance method to update streak based on todo activity
streakSchema.methods.updateStreak = async function(todoData = {}) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day
        
        const { todosAdded = 0, todosCompleted = 0 } = todoData;
        
        // Check if today's entry already exists
        const todayIndex = this.streakHistory.findIndex(
            entry => {
                const entryDate = new Date(entry.date);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === today.getTime();
            }
        );
        
        let todayEntry;
        if (todayIndex !== -1) {
            // Update existing entry
            todayEntry = this.streakHistory[todayIndex];
            todayEntry.todosAdded += todosAdded;
            todayEntry.todosCompleted += todosCompleted;
        } else {
            // Create new entry for today
            todayEntry = {
                date: today,
                todosAdded,
                todosCompleted,
                streakMaintained: false
            };
            this.streakHistory.push(todayEntry);
        }
        
        // Update streak logic
        if (todosCompleted > 0) {
            todayEntry.streakMaintained = true;
            
            if (!this.lastCompletedDate) {
                // First completion
                this.currentStreak = 1;
                this.lastCompletedDate = today;
            } else {
                const lastDate = new Date(this.lastCompletedDate);
                lastDate.setHours(0, 0, 0, 0);
                
                const dayDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
                
                if (dayDiff === 0) {
                    // Same day - no change to streak
                } else if (dayDiff === 1) {
                    // Consecutive day - increment streak
                    this.currentStreak += 1;
                } else {
                    // Gap in days - reset streak
                    this.currentStreak = 1;
                }
                
                this.lastCompletedDate = today;
            }
            
            // Update longest streak if needed
            if (this.currentStreak > this.longestStreak) {
                this.longestStreak = this.currentStreak;
            }
        }
        
        await this.save();
        return this;
        
    } catch (error) {
        throw new Error(`Error updating streak: ${error.message}`);
    }
};

// Instance method to check and reset broken streaks
streakSchema.methods.checkStreakStatus = async function() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (this.lastCompletedDate) {
            const lastDate = new Date(this.lastCompletedDate);
            lastDate.setHours(0, 0, 0, 0);
            
            const dayDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            
            // If more than 1 day has passed without activity, reset streak
            if (dayDiff > 1) {
                this.currentStreak = 0;
                await this.save();
            }
        }
        
        return this;
        
    } catch (error) {
        throw new Error(`Error checking streak status: ${error.message}`);
    }
};

// Static method to get user's current streak
streakSchema.statics.getUserStreak = async function(userId) {
    try {
        const streak = await this.findOne({ userId, isActive: true });
        if (!streak) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastCompletedDate: null,
                streakHistory: []
            };
        }
        
        // Check if streak needs to be reset
        await streak.checkStreakStatus();
        
        return {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            lastCompletedDate: streak.lastCompletedDate,
            streakHistory: streak.streakHistory.slice(-30) // Return last 30 days
        };
        
    } catch (error) {
        throw new Error(`Error getting user streak: ${error.message}`);
    }
};

const Streak = mongoose.model('Streak', streakSchema);

module.exports = Streak;