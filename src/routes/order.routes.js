const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router
  .route("/")
  .post(orderController.createOrder)
  .get(orderController.getAllOrders);

router
  .route("/:orderId")
  .get(orderController.getOrderById)
  .put(orderController.updateOrder)
  .delete(orderController.deleteOrder);

module.exports = router;
