import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import Joi from "joi";
// importing models
import User from "../../models/users.model.js";
import Trainer from "../../models/trainer.model.js";
import Student from "../../models/student.model.js";
import Banner from "../../models/banners.model.js";

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
        return res
          .status(500)
          .json(
            new ApiResponse(
              500,
              {},
              `Something went wrong while adding the ${userType}`
            )
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
        .json(new ApiResponse(403, `You are not authorized`));
    }
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message || "Invalid refresh token"));
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");
    if (user.userType === "Admin") {
      const userIdToDelete = req.body._id;
      const userToDelete = await User.findById(userIdToDelete);
      if (!userToDelete) {
        return res.status(404).json(new ApiResponse(404, {}, "User not found"));
      }

      await User.findByIdAndDelete(req.body._id);

      const deletedUser = await User.findById(userIdToDelete);
      if (deletedUser) {
        return res
          .status(500)
          .json(
            new ApiResponse(
              500,
              {},
              `Something went wrong while deleting the ${userToDelete.userType}`
            )
          );
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            `${userToDelete.userType} deleted successfully`
          )
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

const viewUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");
    if (user.userType === "Admin") {
      const { _id } = req.query;
      const userId = _id;
      const userData = await User.findById(userId).select("-refreshToken");
      if (!userData) {
        return res.status(404).json(new ApiResponse(404, {}, "User not found"));
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { userData },
            `${userData.userType} data fetched successfully`
          )
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

const updateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");
    if (user.userType === "Admin") {
      if (req.body.socialProfile) {
        req.body.socialProfile = JSON.parse(req.body.socialProfile);
      }
      const userSchema = Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        phone: Joi.string().length(10).required(),
        email: Joi.string().email().required(),
        gender: Joi.string().valid("Male", "Female", "Other").required(),
        bloodGroup: Joi.string().valid(
          "A+",
          "A-",
          "B+",
          "B-",
          "AB+",
          "AB-",
          "O+",
          "O-"
        ),
        birthDay: Joi.date().iso().required(),
        address1: Joi.string().required(),
        address2: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        personalInfo: Joi.string().required(),
        socialProfile: Joi.object({
          twitter: Joi.string().allow(null, ""),
          facebook: Joi.string().allow(null, ""),
          instagram: Joi.string().allow(null, ""),
          linkedin: Joi.string().allow(null, ""),
        }).optional(),
      });

      const { error, value } = userSchema.validate(req.body);

      if (error) {
        return res
          .status(403)
          .json(new ApiResponse(403, error.details[0], "Validation failed."));
      }

      const {
        _id,
        name,
        phone,
        email,
        gender,
        birthDay,
        bloodGroup,
        address1,
        address2,
        state,
        country,
        personalInfo,
        socialProfile,
      } = req.body;

      const Updateuser = await User.findById(_id);

      if (Updateuser.phone != phone || Updateuser.email != email) {
        const existingUser = await User.findOne({ phone, email });

        if (existingUser) {
          return res.status(409).json({
            message: "User with provided phone number and email already exists",
          });
        }
      }

      let profilePicture;
      if (req.files?.profilePicture?.[0]?.path) {
        const profilePicturePath = req.files.profilePicture[0].path;
        profilePicture = await uploadOnCloudinary(profilePicturePath);
      }

      // Format birthDay to YYYY-MM-DD
      const formattedBirthDay = new Date(birthDay).toISOString().split("T")[0];

      // Update user fields
      if (profilePicture) Updateuser.profilePicture = profilePicture.url || "";
      Updateuser.name = name || Updateuser.name;
      Updateuser.phone = phone || Updateuser.phone;
      Updateuser.email = email || Updateuser.email;
      Updateuser.gender = gender || Updateuser.gender;
      Updateuser.birthDay = formattedBirthDay || Updateuser.birthDay;
      Updateuser.bloodGroup = bloodGroup || Updateuser.bloodGroup;
      Updateuser.address1 = address1 || Updateuser.address1;
      Updateuser.address2 = address2 || Updateuser.address2;
      Updateuser.state = state || Updateuser.state;
      Updateuser.country = country || Updateuser.country;
      Updateuser.personalInfo = personalInfo || Updateuser.personalInfo;

      // Update social profile
      if (socialProfile) {
        if (!Updateuser.socialProfile) {
          Updateuser.socialProfile = {};
        }
        if (socialProfile.twitter)
          Updateuser.socialProfile.twitter =
            socialProfile.twitter || Updateuser.socialProfile.twitter;
        if (socialProfile.facebook)
          Updateuser.socialProfile.facebook =
            socialProfile.facebook || Updateuser.socialProfile.facebook;
        if (socialProfile.instagram)
          Updateuser.socialProfile.instagram =
            socialProfile.instagram || Updateuser.socialProfile.instagram;
        if (socialProfile.linkedin)
          Updateuser.socialProfile.linkedin =
            socialProfile.linkedin || Updateuser.socialProfile.linkedin;
      }

      // Save the updated user
      await Updateuser.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { user: Updateuser },
            "User updated Successfully"
          )
        );
    } else {
      return res
        .status(403)
        .json(new ApiResponse(403, "You are not authorized"));
    }
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message || "Invalid refresh token"));
  }
});

const addBanner = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");
    if (user.userType === "Admin") {
      const bannerSchema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        offer: Joi.string().optional(),
      });

      const { error, value } = bannerSchema.validate(req.body);

      if (error) {
        return res
          .status(403)
          .json(new ApiResponse(403, error.details[0], "Validation failed."));
      }

      const { name, description, offer = "0" } = value;
      const existingBanner = await Banner.findOne({ name });

      if (existingBanner) {
        res.status(409).json({
          message: "Banner with provided name already exists",
        });
      }

      let bannerImage;
      if (req.files?.bannerImage?.[0]?.path) {
        const bannerImagePath = req.files.bannerImage[0].path;
        bannerImage = await uploadOnCloudinary(bannerImagePath);
      } else {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "Banner image is required"));
      }

      let newBanner = await Banner.create({
        name,
        bannerImage: bannerImage.url,
        description,
        offer,
        status: true,
      });

      const createdBanner = await Banner.findById(newBanner._id);

      if (!createdBanner) {
        return res
          .status(500)
          .json(
            new ApiResponse(
              500,
              {},
              `Something went wrong while creating the banner`
            )
          );
      }

      return res
        .status(201)
        .json(
          new ApiResponse(201, createdBanner, `Banner Created Successfully`)
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

const banners = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");

    if (user.userType === "Admin") {
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

export {
  trainers,
  students,
  addUser,
  addBanner,
  banners,
  deleteUser,
  viewUser,
  updateUser,
};
