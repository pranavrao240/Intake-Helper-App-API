const todoService = require("../services/todos.service");

const Nutrition = require("../models/nutritions.model"); 



exports.findAll = (req, res, next) => {
    const model = {
        userId: req.user.userId,
    };

    todoService.getTodo(model, (error, results) => {
        if (error) {
            return next(error);
        }
        res.status(200).json({ message: "success", data: results });
    });
};


exports.create = (req, res, next) => {
  try {
    const { meals } = req.body;
    const userId = req.user?.userId; // safer optional chaining

    console.log("📦 Incoming request:", req.body);

    // Validate request
    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({
        message: "Invalid or missing 'meals' array in request body",
      });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing userId" });
    }

    // Prepare model for DB
    const model = { userId, meals };

    // Pass to service layer
    todoService.addTodoItem(model, (err, result) => {
      if (err) return next(err);

      res.status(200).json({
        message: "Todo created successfully",
        data: result,
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.resetTodos = async (req, res, next) => {
  try {
    const result = await todoService.resetTodos();
    res.status(200).json({ message: "Todos reset successfully", data: result });
  } catch (error) {
    next(error);
  }
};

exports.getStatusTodos = async (req, res, next) => {
  try {
    const { status } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing userId" });
    }
    
    const model = { userId, status };
    
    // Use callback pattern
    todoService.getStatusTodos(model, (error, result) => {
      if (error) {
        return res.status(500).json({ 
          success: false,
          message: "Failed to get todos by status", 
          error: error.message 
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Todos retrieved successfully", 
        data: result
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const { status, id } = req.params;  // Add id from params
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing userId" });
    }
    
    // Include the todo id in the model
    const model = { userId, status, id };
    
    // Use callback pattern
    todoService.changeTodoItemStatus(model, (error, result) => {
      if (error) {
        return res.status(500).json({ 
          success: false,
          message: "Failed to change status", 
          error: error.message 
        });
      }
      
      res.status(200).json({ 
        success: true,
        message: "Status changed successfully", 
        data: result 
      });
    });
  } catch (error) {
    next(error);
  }
};


exports.delete = (req, res, next) => {
  const mealId = req.body.mealId;
  const userId = req.user.userId;

  if (!mealId) {
    return res.status(400).json({ message: "Missing mealId in request body" });
  }

  const model = { userId, mealId };

  todoService.removeTodoItem(model, (err, result) => {
    if (err) return next(err);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json({
      message: result.message,
      data: result.todo || {}
    });
  });
};
