const MealSuggestionHistory = require('../models/mealSuggestionHistory.model');

/**
 * Saves a new AI meal suggestion prompt and its response to the history database.
 * @param {string} userId - ID of the user performing the search
 * @param {string} prompt - The search prompt / input ingredients
 * @param {any} response - The assistant response returned by the AI
 */
const saveHistory = async (userId, prompt, response) => {
  try {
    if (!prompt) {
      return { success: false, message: 'Prompt is required' };
    }
    if (!response) {
      return { success: false, message: 'Response is required' };
    }

    const historyItem = new MealSuggestionHistory({
      userId,
      prompt,
      response
    });

    await historyItem.save();

    return {
      success: true,
      data: historyItem,
      message: 'AI meal suggestion history saved successfully'
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a user's search suggestion history with pagination.
 * @param {string} userId - ID of the user
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of items per page
 */
const getHistory = async (userId, page = 1, limit = 20, search = '') => {
  try {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build the query object
    const query = { userId };
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { prompt: searchRegex },
        { response: searchRegex }
      ];
    }

    const historyItems = await MealSuggestionHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await MealSuggestionHistory.countDocuments(query);

    return {
      success: true,
      data: historyItems,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a specific history item from the database.
 * @param {string} userId - ID of the user (for ownership verification)
 * @param {string} historyId - ID of the history item to delete
 */
const deleteHistoryItem = async (userId, historyId) => {
  try {
    const deleted = await MealSuggestionHistory.findOneAndDelete({
      _id: historyId,
      userId
    });

    if (!deleted) {
      return { success: false, message: 'History item not found or unauthorized' };
    }

    return { success: true, message: 'History item deleted successfully' };
  } catch (error) {
    throw error;
  }
};

/**
 * Clears all search history items for a specific user.
 * @param {string} userId - ID of the user
 */
const clearHistory = async (userId) => {
  try {
    const result = await MealSuggestionHistory.deleteMany({ userId });
    return {
      success: true,
      message: `Successfully cleared all search history (${result.deletedCount} items deleted)`
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  saveHistory,
  getHistory,
  deleteHistoryItem,
  clearHistory
};
