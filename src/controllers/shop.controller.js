const Shop = require("../models/shop.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const {
  uploadOnCloudinary,
  updateOnCloudinary,
} = require("../utils/FileUploader");

const createShop = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description)
    throw new ApiError(400, "Name and description are required");

  const imageLocalPath = req.file?.path;

  if (!imageLocalPath) throw new ApiError(400, "image is required");

  const owner = req.user?._id; // Assuming you have the user ID stored in req.user

  if (!owner) throw new ApiError(401, "Seems like you are unauthenticated");

  const image = await uploadOnCloudinary(imageLocalPath, "shops");

  if (!image.url) throw new ApiError(400, "Error while uploading image");

  const newShop = await Shop.create({
    name,
    description,
    owner,
    image: image.url,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newShop, "Shop created successfully"));
});

const getAllShops = asyncHandler(async (req, res) => {
  const shops = await Shop.find();

  if (!shops) throw new ApiError(404, "No shops are found");

  return res
    .status(200)
    .json(new ApiResponse(200, shops, "All shops retrieved successfully"));
});

const getUserShops = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const userShops = await Shop.find({ owner: userId });

  if (!userShops) throw new ApiError(404, "No shops found!");

  return res
    .status(200)
    .json(
      new ApiResponse(200, userShops, "User's shops retrieved successfully")
    );
});

const getShopById = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const shop = await Shop.findById(shopId);

  if (!shop) throw new ApiError(404, "Shop not found");

  return res
    .status(200)
    .json(new ApiResponse(200, shop, "Shop retrieved successfully"));
});

const updateShop = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const { name, description } = req.body;

  const shop = await Shop.findById(shopId);

  if (!shop) throw new ApiError(404, "Shop not found");

  const imageLocalPath = req.file?.path;

  const image = await updateOnCloudinary(shop.image, imageLocalPath, "shop");

  shop.name = name;
  shop.description = description;
  shop.image = image.url;
  await shop.save();

  return res
    .status(200)
    .json(new ApiResponse(200, shop, "Shop updated successfully"));
});

const deleteShop = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const deletedShop = await Shop.findByIdAndDelete(shopId);

  if (!deletedShop) throw new ApiError(404, "Shop not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Shop deleted successfully"));
});

module.exports = {
  createShop,
  getAllShops,
  getUserShops,
  getShopById,
  updateShop,
  deleteShop,
};
