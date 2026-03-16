const { getNutritionById } = require('../services/nutritions.service');
const { getSelectedNutrition} = require('../services/nutritions.service');
const { addNutritionData } = require('../services/nutritions.service');
const { deleteNutritionData } = require('../services/nutritions.service');
const { updateNutritionData } = require('../services/nutritions.service');
const {getSavedNutrition} = require('../services/nutritions.service');
const {updateSavedMeal} = require('../services/nutritions.service');
exports.findOne = async (req, res) => {
  const _id = req.params._id;
  console.log('Received _id:', _id);

  if (!_id) {
    return res.status(400).json({ message: 'MongoDB _id is required' });
  }

  const data = await getNutritionById(_id);
  if (data.length === 0) {
    return res.status(404).json({ message: 'Nutrition not found' });
  }

  res.status(200).json(data[0]); 
};


exports.findSelected = async (req, res) => {
  try {
    const result = await getSelectedNutrition();

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'No selected nutrition data found' });
    }

    return res.status(200).json({ message: "Success", data: result });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.findSaved = async (req, res) => {
    try {
        const result = await getSavedNutrition(); // Call without parameters
        
        if (!result || result.length === 0) {
            return res.status(200).json({ 
                message: 'No saved nutrition data found',
                data: [] 
            });
        }
        
        return res.status(200).json({ 
            message: "Success", 
            data: result 
        });
    } catch (error) {
        console.error('Error in findSaved controller:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};


exports.create = async (req, res, next) => {
  try {
    const nutritionData = req.body;
    
    if (!nutritionData || Object.keys(nutritionData).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Nutrition data is required" 
      });
    }

    const result = await addNutritionData(nutritionData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Failed to add nutrition data'
      });
    }

    return res.status(201).json({
      success: true,
      message: "Nutrition data added successfully",
      data: result.data
    });

  } catch (error) {
    console.error('Error in create nutrition controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update nutrition data
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Nutrition ID is required'
      });
    }

    const result = await updateNutritionData(id, updateData);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Nutrition data updated successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Error in update nutrition controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add this function to nutritions.controller.js
exports.updateSavedMeal = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Nutrition ID is required'
            });
        }

  
        const result = await updateSavedMeal(id);

        if (!result.success) {
            return res.status(404).json({
                success: false,
                message: result.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Nutrition data updated successfully',
            data: result.data
        });
    } catch (error) {
        console.error('Error in updateSavedMeal controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete nutrition data
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Nutrition ID is required'
      });
    }

    const result = await deleteNutritionData(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error in delete nutrition controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};