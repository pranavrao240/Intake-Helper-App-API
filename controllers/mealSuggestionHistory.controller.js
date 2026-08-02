const mealSuggestionHistoryService = require('../services/mealSuggestionHistory.service');

/**
 * Endpoint to save AI suggestions history manually.
 * POST /api/meal-suggestions/history
 */
const saveHistory = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required'
      });
    }

    const { prompt, response } = req.body;

    const result = await mealSuggestionHistoryService.saveHistory(userId, prompt, response);

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error saving meal suggestion history',
      error: error.message
    });
  }
};

/**
 * Endpoint to get user's suggestions history (paginated).
 * GET /api/meal-suggestions/history
 */
const getHistory = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required'
      });
    }

    const { page = 1, limit = 20, search = '' } = req.query;

    const result = await mealSuggestionHistoryService.getHistory(userId, page, limit, search);

    return res.status(200).json({
      success: true,
      message: 'AI meal suggestions history retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving meal suggestion history',
      error: error.message
    });
  }
};

/**
 * Endpoint to delete a specific search history item.
 * DELETE /api/meal-suggestions/history/:id
 */
const deleteHistoryItem = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required'
      });
    }

    const { id } = req.params;

    const result = await mealSuggestionHistoryService.deleteHistoryItem(userId, id);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting meal suggestion history item',
      error: error.message
    });
  }
};

/**
 * Endpoint to clear all search history for a user.
 * DELETE /api/meal-suggestions/history
 */
const clearHistory = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required'
      });
    }

    const result = await mealSuggestionHistoryService.clearHistory(userId);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error clearing meal suggestion history',
      error: error.message
    });
  }
};

module.exports = {
  saveHistory,
  getHistory,
  deleteHistoryItem,
  clearHistory
};
