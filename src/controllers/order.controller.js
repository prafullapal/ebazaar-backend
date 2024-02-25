const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { Order, Cart } = require("../models/order.model");

// Controller to create a new order
const createOrder = asyncHandler(async (req, res) => {
  const { customer, orderPrice, products, address, contactNo } = req.body;

  // Check if all required fields are provided
  if (
    ![customer, orderPrice, products, address, contactNo].every(
      (field) => field && field.trim() !== ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Create the order
  const newOrder = await Order.create({
    customer,
    orderPrice,
    products,
    address,
    contactNo,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newOrder, "Order created successfully"));
});

// Controller to get all orders
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find();

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "All orders retrieved successfully"));
});

// Controller to get order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order retrieved successfully"));
});

// Controller to update an order
const updateOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { customer, orderPrice, products, address, contactNo } = req.body;

  // Find the order by ID
  let order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Update the order fields
  if (customer) order.customer = customer;
  if (orderPrice) order.orderPrice = orderPrice;
  if (products) order.products = products;
  if (address) order.address = address;
  if (contactNo) order.contactNo = contactNo;

  // Save the updated order
  order = await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order updated successfully"));
});

// Controller to delete an order
const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const deletedOrder = await Order.findByIdAndDelete(orderId);

  if (!deletedOrder) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order deleted successfully"));
});

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
