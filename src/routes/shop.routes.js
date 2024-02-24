const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop.controller");
const multerMiddleware = require("../middlewares/multer.middleware");
const authMiddleware = require("../middlewares/auth.middleware");

router
  .route("/")
  .get(shopController.getAllShops)
  .post(
    authMiddleware.verifyJWT,
    multerMiddleware.upload.single("image"),
    shopController.createShop
  );

router
  .route("/user")
  .get(authMiddleware.verifyJWT, shopController.getUserShops);

router
  .route("/:shopId")
  .get(shopController.getShopById)
  .put(
    authMiddleware.verifyJWT,
    multerMiddleware.upload.single("image"),
    shopController.updateShop
  )
  .delete(authMiddleware.verifyJWT, shopController.deleteShop);

module.exports = router;
