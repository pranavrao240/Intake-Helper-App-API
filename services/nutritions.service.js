





const mongoose = require('mongoose');

const fs = require('fs');
const csv = require('csv-parser');
const Nutrition = require('../models/nutritions.model.js');

async function importNutritionData(csvFilePath) {
  const nutritionData = [];
 
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        nutritionData.push({
          _id: row['_id'],
          selected: row['selected'] || "Not Selected",
          DishImage: row['DishImage'],
          DishName: row['DishName'],
          Calories: parseFloat(row['Calories']) || 0,
          Protein: parseFloat(row['Protein']) || 0,
          Carbohydrates: parseFloat(row['Carbohydrates']) || 0,
          Fat: parseFloat(row['Fat']) || 0,
          Fiber: parseFloat(row['Fiber']) || 0,
          Sodium: parseFloat(row['Sodium']) || 0,
          Iron: parseFloat(row['Iron']) || 0,
          Calcium: parseFloat(row['Calcium']) || 0,
          Sugar: parseFloat(row['Sugar']) || 0,
          QuantityRequired: row['QuantityRequired'] || '',
          nutritionId: row['nutritionId'] || null,
          type: row['type'] || 'Breakfast',
          time: row['time'] || 'Morning',
          Fats: parseFloat(row['Fat']) || 0,
          Carbohydrt: parseFloat(row['Carbohydrates']) || 0,
        });
      })
      .on('end', async () => {
        try {
          console.log(`Importing ${nutritionData.length} nutrition records...`);
          
          await Nutrition.deleteMany({});
          
          const insertedData = await Nutrition.insertMany(nutritionData);
          console.log(`✅ Successfully imported ${insertedData.length} nutrition records`);
          
          resolve(insertedData);
        } catch (error) {
          console.error('Error inserting nutrition data:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

const getNutritionById = async (nutritionId) => {
  console.log('Querying nutritionId (MongoDB _id):', nutritionId);
  try {
    const result = await Nutrition.findById(new mongoose.Types.ObjectId(nutritionId));
    console.log('Query result:', result);
    return result ? [result] : [];  
  } catch (err) {
    console.error('Error fetching nutrition:', err.message);
    return [];
  }
};

const getSelectedNutrition = async () => {
  return await Nutrition.find({ selected: "Select" });
};

const getAllNutrition = async (page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    const nutrition = await Nutrition.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Nutrition.countDocuments();
    
    return {
      data: nutrition,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    console.error('Error fetching nutrition data:', error.message);
    throw error;
  }
};

const addNutritionData = async (nutritionData) => {
  try {
    if (!nutritionData.DishName) {
      throw new Error('DishName is required');
    }
    if (!nutritionData.DishImage) {
      throw new Error('DishImage is required');
    }

    const existingDish = await Nutrition.findOne({ DishName: nutritionData.DishName });
    if (existingDish) {
      throw new Error('Dish with this name already exists');
    }

    const nutrition = new Nutrition({
      ...nutritionData,
      selected: nutritionData.selected || "Not Selected",
      type: nutritionData.type || "NULL",
      time: nutritionData.time || "NULL",
      day: nutritionData.day || [],
      Protein: nutritionData.Protein || 0,
      Calories: nutritionData.Calories || 0,
      Carbohydrates : nutritionData.Carbohydrates || 0,
      QuantityRequired: nutritionData.QuantityRequired || "NULL",
      

    });

    const savedNutrition = await nutrition.save();
    return {
      success: true,
      data: savedNutrition
    };
  } catch (error) {
    console.error('Error adding nutrition data:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to add nutrition data'
    };
  }
};

const updateNutritionData = async (id, updateData) => {
  try {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('No update data provided');
    }

    if (updateData.DishName) {
      const existingDish = await Nutrition.findOne({ 
        DishName: updateData.DishName,
        _id: { $ne: id } 
      });
      
      if (existingDish) {
        throw new Error('A dish with this name already exists');
      }
    }

    const updatedNutrition = await Nutrition.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedNutrition) {
      throw new Error('Nutrition data not found');
    }

    return {
      success: true,
      data: updatedNutrition
    };
  } catch (error) {
    console.error('Error updating nutrition data:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to update nutrition data'
    };
  }
};



const deleteNutritionData = async (id) => {
  try {
    const deletedNutrition = await Nutrition.findByIdAndDelete(id);
    
    if (!deletedNutrition) {
      throw new Error('Nutrition data not found');
    }

    return {
      success: true,
      message: 'Nutrition data deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting nutrition data:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to delete nutrition data'
    };
  }
};



module.exports = {
  importNutritionData,
  getNutritionById,
  getSelectedNutrition,
  getAllNutrition,
  addNutritionData,
  updateNutritionData,
  deleteNutritionData
};
