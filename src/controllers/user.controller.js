const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/user.model");
const {
  uploadOnCloudinary,
  updateOnCloudinary,
} = require("../utils/FileUploader");
const jwt = require("jsonwebtoken");

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong in generating tokens.");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Input validation
  if (
    ![fullName, email, username, password].every(
      (field) => field && field.trim() !== ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // File upload handling
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload files to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath, "user/avatars");
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  // Create new user
  const newUser = new User({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
  });
  await newUser.save();

  // Return response
  const responseData = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!responseData) {
    throw new ApiError(500, "Failed to retrieve user data after registration");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, responseData, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  const user = await User.findOne({ email });

  if (!user) throw new ApiError(404, "User does not exists!");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(404, "Refresh Token  is missing");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user,
            accessToken,
            refreshToken,
          },
          "Access Token generated successfully!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword || newPassword))
    throw new ApiError(400, "Old and new password are required");

  const user = await User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) throw new ApiError(401, "Old password does not match");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully!"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(fullName || email)) throw new ApiError(400, "All fields are required");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully!"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const newAvatarPath = req.file?.path;

  if (!newAvatarPath) throw new ApiError(400, "Avatar is required");

  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  const avatar = await updateOnCloudinary(
    user.avatar,
    newAvatarPath,
    "user/avatars"
  );

  if (!avatar.url) throw new ApiError(400, "Error while uploading Avatar");

  user.avatar = avatar.url;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Successfully!"));
});

const toggleSeller = asyncHandler(async (req, res) => {});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  toggleSeller,
};
