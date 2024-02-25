const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const multerMiddleware = require("../middlewares/multer.middleware");

// Create a new product
router
  .route("/")
  .post(
    authMiddleware.verifyJWT,
    multerMiddleware.upload.single("image"),
    productController.createProduct
  );

// Get all products
router.route("/").get(productController.getAllProducts);

// Get product by ID
router.route("/:productId").get(productController.getProductById);

// Update a product
router
  .route("/:productId")
  .put(
    authMiddleware.verifyJWT,
    multerMiddleware.upload.single("image"),
    productController.updateProduct
  );

// Delete a product
router
  .route("/:productId")
  .delete(authMiddleware.verifyJWT, productController.deleteProduct);

// Get products by shop
router.route("/shop/:shopId").get(productController.getProductByShop);

module.exports = router;
