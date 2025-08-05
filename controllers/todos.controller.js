const todoService = require("../services/todos.service");

const Nutrition = require("../models/nutritions.model"); // adjust the path as needed



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
  const { meals } = req.body;
  const userId = req.user.userId;

  console.log("📦 Incoming request:", req.body);

  if (!meals || !Array.isArray(meals)) {
    return res.status(400).json({ message: "Missing or invalid meals in request body" });
  }

  const model = { userId, meals };

  todoService.addTodoItem(model, (err, result) => {
    if (err) return next(err);

    res.status(200).json({
      message: "success",
      data: result
    });
  });
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
