const express = require("express");
const router = express.Router();

// Import individual route modules
const healthCheckRoutes = require("./healthcheck.routes");
const userRoutes = require("./user.routes");

router.use("/health-check", healthCheckRoutes);
router.use("/users", userRoutes);

module.exports = router;
