import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { http } from "winston";
import jwt from "jsonwebtoken"

const generateAcessandRefreshToken = async(userId) => {
  try {
    const user = await User.findById(userId)
  
    if(!user) {
      throw new ApiError(404, "User not found")
    }
  
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
  
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "Something went wrong while saving access and refresh tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Uploaded avatar", avatar);
  } catch (error) {
    console.log("Error uploading avatar", error);
    throw new ApiError(400, "Failed to upload Avatar");
  }

  let coverImage;
  try {
    coverImage = await uploadOnCloudinary(coverLocalPath);
    console.log("Uploaded Cover Image", coverImage);
  } catch (error) {
    console.log("Error uploading Cover Image", error);
    throw new ApiError(400, "Failed to upload Cover Image");
  }

try {
    let user;
    try {
      user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
      });
    } catch (error) {
      console.log("Error creating user:", error.message);
      throw new ApiError(400, error.message);
    }
  
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
  
    if (!createdUser) {
      throw new ApiError(500, "Something Went Wrong While registering a user");
    }
  
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
} catch (error) {
  console.log("User Creation is failed")

  if(avatar) {
    await deleteFromCloudinary(avatar.public_id)
  }
  if(coverImage) {
    await deleteFromCloudinary(coverImage.public_id)
  }
      throw new ApiError(500, "Something Went Wrong While registering a user and images were deleted");
}
});

const loginUser = asyncHandler(async (req, res) => {
  const {username, email, password} = req.body
  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  })

  if(!user) {
    throw new ApiError(404, "User not found")
  }

  const isPasswordVaid = await isPasswordCorrect(password)

  if (!isPasswordVaid) {
    throw new ApiError(401, "Invalid Credentials")
  }

  const{accessToken, refreshToken} = await generateAcessandRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id)
  .select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }

  return res
  .status(200)
  .cookie("acessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(200, loggedInUser, "User logged in successfully"))
})

const logoutUser = asyncHandler (async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id, 
    {
      $set: {
        refreshToken: undefined, 
      }
    },
    {new: true}
  )

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  }

  return res
    .status(200)
    .clearCookie("acessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out Successfully"))
})

const refreshAcessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken) {
    throw new ApiError(401, "Refresh Token is required")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)

    if(!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if(user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token")
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }

    const {accessToken, refreshToken: newRefreshToken} = await generateAcessandRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
  } catch (error) {
    throw new ApiError(500, "Something went wrong while refreshing access token")
  }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body

  const user = await User.findById(req.user?._id)

  const isPasswordValid = user.isPasswordCorrect(oldPassword)

  if(!isPasswordValid) {
    throw new ApiError(401, "Invalid Password")
  }

  user.password = newPassword

  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password Change Successfully"))
})
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200)
  .json(new ApiResponse(200, {}, "Current User Details"))
})
const updateAccountDetails = asyncHandler(async (req, res) => {
  const {fullname, email} = req.body

  if(!fullname || email) {
    throw new ApiError(400, "Full Name or Email are required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email
      }
    },
    {new: true}
  ).select("-password -refreshToken")

  return res
  .status(200)
  .json(new ApiResponse(200, user, "Account Details Updated Successfully"))
})
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "File is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url) {
    throw new ApiError(500, "Something Went Wrong While Uploading avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {new: true}
  ).select("-password -refreshToken")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Successfully"));
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;

  if (!coverLocalPath) {
    throw new ApiError(400, "File is required")
  }

  const coverImage = await uploadOnCloudinary(coverLocalPath)

  if(!coverImage.url) {
    throw new ApiError(500, "Something Went Wrong While Uploading cover image")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    {new: true}
  ).select("-password -refreshToken")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Updated Successfully"));
})

export {
  registerUser,
  loginUser,
  refreshAcessToken,
  logoutUser,
  changeCurrentPassword,
  updateUserCoverImage,
  updateUserAvatar,
  updateAccountDetails
};