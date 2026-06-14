import mongoose, {isValidObjectId} from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandle.js";
import { Comment } from "../models/comment.models.js";

const getComments = asyncHandler(async(req, res) => {
    const {videoID} = req.params
    const {page = 1, limit = 10} = req.query

    if (!isValidObjectId(videoID)) {
        throw new ApiError(400, "Invalid video")
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const  comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoID)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limitNumber
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            _id: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $arrayElemAt: ["$owner", 0]
                }
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "comment",
                as: "replies"
            }
        },
        {
            $addFields: {
                repliesCount: {
                    $size: "$replies"
                }
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                likesCount: 1,
                repliesCount: 1,
                owner: 1
            }
        }
    ])
}); 