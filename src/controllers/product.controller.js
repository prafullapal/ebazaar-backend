const Product = require("../models/product.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const {
  uploadOnCloudinary,
  updateOnCloudinary,
} = require("../utils/FileUploader");

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, shop, category } = req.body;
  const imageLocalPath = req.file?.path;

  if (
    ![name, description, price, stock, shop, category, imageLocalPath].every(
      (field) => field && field.trim() !== ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const image = await uploadOnCloudinary(imageLocalPath);

  const newProduct = await Product.create({
    name,
    description,
    price,
    stock,
    shop,
    category,
    image: image.url,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newProduct, "Product created successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, stock, category } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const imageLocalPath = req.file?.path;

  const image = await updateOnCloudinary(
    product.image,
    imageLocalPath,
    "product"
  );

  if (name) {
    product.name = name;
  }
  if (description) {
    product.description = description;
  }
  if (price) {
    product.price = price;
  }
  if (stock) {
    product.stock = stock;
  }
  if (category) {
    product.category = category;
  }
  if (image) {
    product.image = image.url;
  }
  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(productId);

  if (!deletedProduct) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product retrieved successfully"));
});

const getProductByShop = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const products = await Product.find({ shop: shopId });

  if (!products.length) {
    throw new ApiError(404, "No products found for this shop");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products retrieved successfully"));
});

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductByShop,
};
