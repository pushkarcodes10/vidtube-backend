import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await getCloudinary().uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    await fs.unlink(localFilePath);
    return response;
  } catch (error) {
    console.error("CLOUDINARY UPLOAD ERROR:", error);
    try {
      await fs.unlink(localFilePath);
    } catch (unlinkError) {
      console.error("Failed to delete local file:", unlinkError.message);
    }
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    console.log("Deleted from cloudinary. Public id", publicId);
  } catch (error) {
    console.log("Error deleting from cloudinary", error)
    return null
  }
}

export { uploadOnCloudinary, deleteFromCloudinary};