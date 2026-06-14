import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js"
import { Like } from "../models/like.models.js"
import { Subscription } from "../models/subsription.models.js";
import { ApiResponse } from "../utils/ApiResponse.jsApiError.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if(!isValidObjectId(channelId)) {
        throw new   ApiError(400, "Invalid channel")
    }

    const stats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likes: {
                    $size: "$likes"
                }
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $addFields: {
                comments: {
                    $size: "$comments"
                }
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                subscribers: {
                    $size: "$subscribers"
                }
            }
        }
    ])
})

const getChannelVideos = asyncHandler(async (req, res) => {

})

export {
    getChannelStats,
    getChannelVideos
}