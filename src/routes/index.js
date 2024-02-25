const express = require("express");
const router = express.Router();

// Import individual route modules
const healthCheckRoutes = require("./healthcheck.routes");
const userRoutes = require("./user.routes");
const shopRoutes = require("./shop.routes");
const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");

router.use("/health-check", healthCheckRoutes);
router.use("/users", userRoutes);
router.use("/shops", shopRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);

module.exports = router;
