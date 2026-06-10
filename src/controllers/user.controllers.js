import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
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
        fullName,
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

export { registerUser };