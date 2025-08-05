const { getNutritionById } = require('../services/nutritions.service');
const { getSelectedNutrition} = require('../services/nutritions.service');

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