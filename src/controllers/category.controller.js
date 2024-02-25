const Category = require("../models/category.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required for the category");
  }

  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    throw new ApiError(400, "Category with this name already exists");
  }

  const newCategory = await Category.create({ name });

  return res
    .status(201)
    .json(new ApiResponse(201, newCategory, "Category created successfully"));
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  return res
    .status(200)
    .json(
      new ApiResponse(200, categories, "All categories fetched successfully")
    );
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required for updating the category");
  }

  const category = await Category.findByIdAndUpdate(
    categoryId,
    { name },
    { new: true }
  );

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
};
