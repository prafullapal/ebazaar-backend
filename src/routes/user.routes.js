const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const multerMiddleware = require("../middlewares/multer.middleware");

// Public routes
router
  .route("/register")
  .post(multerMiddleware.upload.single("avatar"), userController.registerUser);

router.route("/login").post(userController.loginUser);

// Secured routes
router.use(authMiddleware.verifyJWT);

router.route("/logout").get(userController.logoutUser);

router.route("/refresh-token").post(userController.refreshAccessToken);

router
  .route("/current")
  .get(userController.getCurrentUser)
  .put(userController.updateAccountDetails);

router
  .route("/avatar")
  .put(
    multerMiddleware.upload.single("avatar"),
    userController.updateUserAvatar
  );

router.route("/change-password").put(userController.changeCurrentPassword);

module.exports = router;
