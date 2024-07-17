import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/users.model.js";
import Student from "../models/student.model.js";
import Joi from "joi";
import bcrypt from "bcrypt";

const register = async (req, res) => {
  const userRegisterSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required(),
  });

  const { error, value } = userRegisterSchema.validate(req.body);
  if (error) {
    return res
      .status(403)
      .json(new ApiResponse(403, error.details[0], "Validation failed."));
  }

  const { phone, email, name, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res
      .status(403)
      .json(new ApiError(403, "Password and confirm password do not match"));
  }

  try {
    const existingUser = await User.findOne({ phone, email });
    if (existingUser) {
      res.status(409).json({
        message: "User with provided phone number or email already exists",
      });
    }
    const student = await Student.create({
      phone,
      email,
      name,
      password,
    });
    const createdStudent = await Student.findById(student._id).select(
      "refreshToken"
    );

    if (!createdStudent) {
      throw new ApiError(500, "Something went wrong while creating user");
    }
    return res
      .status(201)
      .json(
        new ApiResponse(201, createdStudent, "User registered successfully")
      );
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to register user", error: err.message });
  }
};

const login = async (req, res) => {
  const userLoginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error, value } = userLoginSchema.validate(req.body);
  if (error) {
    return res
      .status(403)
      .json(new ApiResponse(403, error.details[0], "Validation failed."));
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      const passMatch = await bcrypt.compare(password, user.password);
      if (passMatch) {
        return res
          .status(200)
          .json(new ApiResponse(200, [user], "Logged in successfully"));
      }
      return res
        .status(401)
        .json(new ApiResponse(401, [req.body], "Password is invalid"));
    }
    return res
      .status(401)
      .json(new ApiResponse(400, [], "User account is not registered"));
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to login user", error: err.message });
  }
};

export { register, login };
