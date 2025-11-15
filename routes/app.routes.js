// const express = require('express');
// const router = express.Router();

// const nutritionController = require('../controllers/nutritions.controller');
// const { importNutritionData } = require('../services/nutritions.service');
// const userController = require('../controllers/users.controller');
// const {authenticationToken} = require("../middleware/auth");
// const todoController = require("../controllers/todos.controller");

// const todo = require("../models/todos.model");


// const Nutrition = require('../models/nutritions.model')

// router.get('/nutrition/import', async (req, res) => {
//   try {
//     const nutritionData = await Nutrition.find(); 
//     res.status(200).json({
//       message: 'Nutrition data fetched successfully.',
//       data: nutritionData
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Failed to fetch nutrition data',
//       error: error.message
//     });
//   }
// });

// module.exports = router;


//   router.get('/nutrition/:_id', nutritionController.findOne); 
  
  
//   router.post("/login",userController.login);
//   router.post("/register",userController.register);

  
// router.post("/todos",[authenticationToken],todoController.create);
// router.get("/todos",[authenticationToken],todoController.findAll);
// router.delete("/todos",[authenticationToken],todoController.delete);
// module.exports = router;


const express = require('express');
const router = express.Router();

const nutritionController = require('../controllers/nutritions.controller');
const userController = require('../controllers/users.controller');
const { authenticationToken } = require("../middleware/auth");
const todoController = require("../controllers/todos.controller");

const Nutrition = require('../models/nutritions.model');


router.get('/nutrition/import', async (req, res) => {
  try {
    const nutritionData = await Nutrition.find(); 
    res.status(200).json({
      message: 'Nutrition data fetched successfully.',
      data: nutritionData
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch nutrition data',
      error: error.message
    });
  }
});


router.get('/nutrition/:_id', nutritionController.findOne); 


router.post("/login", userController.login);
router.post("/register", userController.register);


router.post("/todos", authenticationToken, todoController.create);
router.get("/todos", authenticationToken, todoController.findAll);
router.delete("/todos", authenticationToken, todoController.delete);
router.get('/reset-todos', authenticationToken, todoController.resetTodos);



module.exports = router;
