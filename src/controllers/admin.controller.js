import User from "../models/users.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const trainers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");

    if (user.userType === "Admin") {
      const trainers = await User.find({ userType: "Trainer" });

      if (trainers.length === 0) {
        return res.status(200).json(
          new ApiResponse(200, {
            message: "No trainers are available",
            trainers: [],
          })
        );
      }

      return res.status(200).json(
        new ApiResponse(200, {
          message: "All trainers are fetched",
          trainers: trainers,
        })
      );
    } else {
      return res
        .status(403)
        .json(new ApiResponse(403, "You are not authorized to view trainers"));
    }
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message || "Invalid refresh token"));
  }
};

const students = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");

    if (user.userType === "Admin") {
      const trainers = await User.find({ userType: "Student" });

      if (trainers.length === 0) {
        return res.status(200).json(
          new ApiResponse(200, {
            message: "No students are available",
            trainers: [],
          })
        );
      }

      return res.status(200).json(
        new ApiResponse(200, {
          message: "All students are fetched",
          trainers: trainers,
        })
      );
    } else {
      return res
        .status(403)
        .json(new ApiResponse(403, "You are not authorized to view students"));
    }
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message || "Invalid refresh token"));
  }
};

export { trainers, students };
