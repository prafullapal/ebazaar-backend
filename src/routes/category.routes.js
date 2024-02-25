const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);

router
  .route("/:categoryId")
  .get(categoryController.getCategoryById)
  .put(categoryController.updateCategory);

module.exports = router;
