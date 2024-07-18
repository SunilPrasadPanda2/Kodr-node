import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Joi from "joi";
import User from "../models/users.model.js";
import Trainer from "../models/trainer.model.js";
import Student from "../models/student.model.js";

const trainers = asyncHandler(async (req, res) => {
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
});

const students = asyncHandler(async (req, res) => {
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
});

const addUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");
    if (user.userType === "Admin") {
      const userRegisterSchema = Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().length(10).required(),
        email: Joi.string().required(),
        gender: Joi.string().valid("Male", "Female", "Other").required(),
        password: Joi.string().required(),
        userType: Joi.string().valid("Trainer", "Student").required(),
      });

      const { error, value } = userRegisterSchema.validate(req.body);

      if (error) {
        return res
          .status(403)
          .json(new ApiResponse(403, error.details[0], "Validation failed."));
      }
      const { name, phone, email, gender, password, userType } = value;
      const existingUser = await User.findOne({ phone, email });
      if (existingUser) {
        res.status(409).json({
          message: "User with provided phone number and email already exists",
        });
      }

      let newUser;
      if (userType === "Trainer") {
        newUser = await Trainer.create({
          phone,
          userType,
          name,
          email,
          gender,
          password,
        });
      } else if (userType === "Student") {
        newUser = await Student.create({
          phone,
          userType,
          name,
          email,
          gender,
          password,
        });
      }
      const createdUser = await User.findById(newUser._id).select(
        "-refreshToken"
      );

      if (!createdUser) {
        throw new ApiError(
          500,
          `Something went wrong while adding the ${userType}`
        );
      }

      return res
        .status(201)
        .json(
          new ApiResponse(201, createdUser, `${userType} added successfully`)
        );
    } else {
      return res
        .status(403)
        .json(
          new ApiResponse(403, `You are not authorized`)
        );
    }
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message || "Invalid refresh token"));
  }
});

export { trainers, students, addUser };
