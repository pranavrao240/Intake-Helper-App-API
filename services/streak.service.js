const Streak = require('../models/streak.model.js');


async function getStreak(userId) {
    try {
        // getUserStreak already handles checkStreakStatus + returns last 30 days
        const streakData = await Streak.getUserStreak(userId);
        return streakData;
    } catch (error) {
        throw new Error(`Failed to get streak: ${error.message}`);
    }
}

/**
 * Update streak when user logs nutrition / completes a todo
 * @param {string} userId
 * @param {Object} todoData - { todosAdded: number, todosCompleted: number }
 */
async function updateStreak(userId, todoData = {}) {
    try {
        const streak = await Streak.getOrCreateStreak(userId);

        // Always check streak status BEFORE updating
        // This resets the streak if the user missed yesterday
        await streak.checkStreakStatus();

        await streak.updateStreak(todoData);

        return {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            lastCompletedDate: streak.lastCompletedDate,
            streakHistory: streak.streakHistory.slice(-30),
        };
    } catch (error) {
        throw new Error(`Failed to update streak: ${error.message}`);
    }
}

/**
 * Reset a user's streak manually (e.g. admin action)
 */
async function resetStreak(userId) {
    try {
        const streak = await Streak.findOne({ userId });
        if (!streak) throw new Error('Streak not found');

        streak.currentStreak = 0;
        streak.lastCompletedDate = null;
        await streak.save();

        return { message: 'Streak reset successfully' };
    } catch (error) {
        throw new Error(`Failed to reset streak: ${error.message}`);
    }
}

module.exports = {
    getStreak,
    updateStreak,
    resetStreak,
};