import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/users.model.js";
import Student from "../models/student.model.js";
import Joi from "joi";
import bcrypt from "bcrypt";
import Banner from "../models/banners.model.js";

const banners = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");

    if (user.userType === "Student") {
      const banners = await Banner.find({});

      if (banners.length === 0) {
        return res.status(200).json(
          new ApiResponse(200, {
            message: "No banners are available",
            banners: [],
          })
        );
      }

      return res.status(200).json(
        new ApiResponse(200, {
          message: "All banners are fetched",
          banners: banners,
        })
      );
    } else {
      return res
        .status(403)
        .json(new ApiResponse(403, "You are not authorized to view banners"));
    }
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message || "Invalid refresh token"));
  }
});

export { banners };
