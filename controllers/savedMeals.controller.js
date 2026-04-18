const savedMealService = require('../services/savedMeals.service');

const saveMeal = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { nutritionId, customNotes, quantity } = req.body;

    const result = await savedMealService.saveMeal(userId, nutritionId, customNotes, quantity);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Meal saved successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving meal',
      error: error.message
    });
  }
};

const getSavedMeals = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const result = await savedMealService.getSavedMeals(userId, page, limit);
    
    res.status(200).json({
      success: true,
      message: 'Saved meals retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving saved meals',
      error: error.message
    });
  }
};

const getSavedMeal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await savedMealService.getSavedMeal(userId, id);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Saved meal retrieved successfully',
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving saved meal',
      error: error.message
    });
  }
};

const updateSavedMeal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { customNotes, quantity } = req.body;

    const result = await savedMealService.updateSavedMeal(userId, id, customNotes, quantity);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Saved meal updated successfully',
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating saved meal',
      error: error.message
    });
  }
};

const unsaveMeal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await savedMealService.unsaveMeal(userId, id);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Meal unsaved successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unsaving meal',
      error: error.message
    });
  }
};

const checkIfMealSaved = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nutritionId } = req.params;

    const result = await savedMealService.checkIfMealSaved(userId, nutritionId);
    
    res.status(200).json({
      success: true,
      isSaved: result.isSaved,
      savedMealId: result.savedMealId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking saved status',
      error: error.message
    });
  }
};

module.exports = {
  saveMeal,
  getSavedMeals,
  getSavedMeal,
  updateSavedMeal,
  unsaveMeal,
  checkIfMealSaved
};
