import { Router } from "express";
import Joi from "joi";
import Trainer from "../models/trainer.model.js";
import Student from "../models/student.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import Category from "../models/category.model.js";

const web = Router();

web.route("/admin/all-trainers").get(async (req, res) => {
  try {
    const trainers = await Trainer.find({});
    return res.status(200).json(new ApiResponse(200, trainers, "trainers"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "something went wrong"));
  }
});

web.route("/admin/add-trainer").post(async (req, res) => {
  const trainerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error, value } = trainerSchema.validate(req.body);

  if (error) {
    return res
      .status(403)
      .json(new ApiResponse(401, error, "Validation failed"));
  }

  const { name, email, phone, password } = value;

  const existingTrainer = await Trainer.findOne({
    $or: [{ email: email }, { phone: phone }],
  });

  console.log(existingTrainer);
  if (existingTrainer) {
    return res
      .status(409)
      .json(new ApiResponse(409, value, "Trainer already exists"));
  }

  const trainer = await Trainer.create({
    name,
    phone,
    email,
    password,
  });

  const trainerCreated = await Trainer.findById(trainer._id).select(
    "-refreshToken"
  );

  if (!trainerCreated) {
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong while creating trainer"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, trainerCreated, "Trainer created"));
});

web.route("/admin/all-students").get(async (req, res) => {
  try {
    const students = await Student.find({});
    return res.status(200).json(new ApiResponse(200, students, "All students"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Something went wrong"));
  }
});

web.route("/admin/add-categories").post(async (req, res) => {
  const categorySchema = Joi.object({
    name: Joi.string().required(),
    subcategories: Joi.array(),
  });
  const [error, value] = categorySchema.validate(req.body);
  if (error) {
    return res
      .status(403)
      .json(new ApiResponse(200, error, "Validation failed"));
  }

  const category = await Category.create(res.body);
});

export default web;
