import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import Joi from "joi";
// importing models
import User from "../../models/users.model.js";
import Course from "../../models/course.model.js";
import Category from "../../models/category.model.js";

const addCategory = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");
    if (user.userType === "Admin") {
      const categorySchema = Joi.object({
        name: Joi.string().required(),
      });

      const { error, value } = categorySchema.validate(req.body);

      if (error) {
        return res
          .status(403)
          .json(new ApiResponse(403, error.details[0], "Validation failed."));
      }

      const { name } = value;

      let newCategory = await Category.create({
        name,
      });

      const createdCategory = await Category.findById(newCategory._id);

      if (!createdCategory) {
        return res
          .status(500)
          .json(
            new ApiResponse(
              500,
              {},
              `Something went wrong while creating the course`
            )
          );
      }

      return res
        .status(201)
        .json(
          new ApiResponse(201, createdCategory, `Category Created Successfully`)
        );
    } else {
      return res
        .status(403)
        .json(new ApiResponse(403, `You are not authorized`));
    }
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message || "Invalid refresh token"));
  }
});

const addCourse = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");
    if (user.userType === "Admin") {
      const lessonSchema = Joi.object({
        title: Joi.string().optional(),
        videos: Joi.string().optional(),
        duration: Joi.string().optional(),
      });

      const sectionSchema = Joi.object({
        title: Joi.string().required(),
        numberOfLessons: Joi.number().optional(),
        duration: Joi.string().optional(),
        description: Joi.string().optional(),
        lessons: Joi.array().items(lessonSchema).optional(),
      });

      const courseSchema = Joi.object({
        category: Joi.string().required(),
        courseName: Joi.string().required(),
        description: Joi.string().required(),
        longDescription: Joi.string().required(),
        studentsEnrolled: Joi.string().hex().length(24).optional(),
        closeCaption: Joi.string().optional(),
        author: Joi.string().required(),
        aboutAuthor: Joi.string().required(),
        sections: Joi.array().items(sectionSchema).optional(),
        numberOfSections: Joi.number().optional(),
      });

      const { error, value } = courseSchema.validate(req.body);

      if (error) {
        return res
          .status(403)
          .json(new ApiResponse(403, error.details[0], "Validation failed."));
      }

      const {
        category,
        courseName,
        description,
        longDescription,
        studentsEnrolled,
        closeCaption,
        author,
        aboutAuthor,
        sections,
        numberOfSections,
      } = value;

      // Find the category by its name
      const categoryDocument = await Category.findOne({ name: category });
      if (!categoryDocument) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "Invalid category name"));
      }

      let courseImage;
      if (req.files?.courseImage?.[0]?.path) {
        const courseImagePath = req.files.courseImage[0].path;
        courseImage = await uploadOnCloudinary(courseImagePath);
      } else {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "Banner image is required"));
      }

      let newCourse = await Course.create({
        category: categoryDocument._id,
        courseName,
        courseImage: courseImage.url,
        description,
        longDescription,
        studentsEnrolled,
        closeCaption,
        author,
        aboutAuthor,
        sections,
        numberOfSections,
      });

      const createdCourse = await Course.findById(newCourse._id);

      if (!createdCourse) {
        return res
          .status(500)
          .json(
            new ApiResponse(
              500,
              {},
              `Something went wrong while creating the course`
            )
          );
      }

      return res
        .status(201)
        .json(
          new ApiResponse(201, createdCourse, `Course Created Successfully`)
        );
    } else {
      return res
        .status(403)
        .json(new ApiResponse(403, `You are not authorized`));
    }
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message || "Invalid refresh token"));
  }
});

export { addCourse, addCategory };
