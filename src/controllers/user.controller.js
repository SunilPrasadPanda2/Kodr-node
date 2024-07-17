import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import Joi from "joi";
import bcrypt from "bcrypt";

// models
import User from "../models/users.model.js";
import Admin from "../models/admin.model.js";
import Trainer from "../models/trainer.model.js";
import Student from "../models/student.model.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const userRegisterSchema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().length(10).required(),
    email: Joi.string().required(),
    gender: Joi.string().valid("Male", "Female", "Other").required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required(),
    userType: Joi.string().valid("Admin", "Trainer", "Student").required(),
  });

  const { error, value } = userRegisterSchema.validate(req.body);

  if (error) {
    return res
      .status(403)
      .json(new ApiResponse(403, error.details[0], "Validation failed."));
  }
  const { name, phone, email, gender, password, confirmPassword, userType } =
    req.body;

  if (password !== confirmPassword) {
    return res
      .status(403)
      .json(new ApiError(403, "Password and confirm password do not match"));
  }

  try {
    const existingUser = await User.findOne({ phone, email });
    if (existingUser) {
      res.status(409).json({
        message: "User with provided phone number and email already exists",
      });
    }

    // const profilePicturePath = req.files?.profilePicture?.[0]?.path;
    // if (!profilePicturePath) {
    //   throw new ApiError(400, "Profile picture file is required");
    // }

    // const profilePicture = await uploadOnCloudinary(profilePicturePath);

    // // Update user fields
    // user.profilePicture = profilePicture.url || "";

    let newUser;
    if (userType === "Admin") {
      newUser = await Admin.create({
        phone,
        userType,
        name,
        email,
        gender,
        password,
      });
    } else if (userType === "Trainer") {
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
        "Something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to register user", error: err.message });
  }
});

const loginUserByEmail = asyncHandler(async (req, res) => {
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

  const { email, password } = value;

  try {
    const user = await User.findOne({ email });
    if (user) {
      const passMatch = await bcrypt.compare(password, user.password);
      if (passMatch) {
        const { accessToken, refreshToken } =
          await generateAccessAndRefereshTokens(user._id);
        const loggedInUser = await User.findById(user._id).select(
          "-refreshToken"
        );

        const options = {
          httpOnly: true,
          secure: true,
        };
        return res
          .status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json(
            new ApiResponse(
              200,
              {
                user: loggedInUser,
                accessToken,
                refreshToken,
              },
              "User logged In Successfully"
            )
          );
      }
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Incorrect Password"));
    }
    return res
      .status(401)
      .json(new ApiResponse(400, {}, "User with this email does not exist."));
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to login user", error: err.message });
  }
});

const loginUserByPhone = asyncHandler(async (req, res) => {
  const userLoginSchema = Joi.object({
    phone: Joi.string().required(),
    otp: Joi.string().length(4).pattern(/^\d+$/).required(),
  });

  const { error, value } = userLoginSchema.validate(req.body);
  if (error) {
    return res
      .status(403)
      .json(new ApiResponse(403, error.details[0], "Validation failed."));
  }

  const { phone, otp } = value;

  if (otp !== '2222') {
    return res
      .status(403)
      .json(new ApiResponse(403, {}, "Invalid OTP."));
  }

  try {
    const user = await User.findOne({ phone });
    if (user) {
      const { accessToken, refreshToken } =
        await generateAccessAndRefereshTokens(user._id);
      const loggedInUser = await User.findById(user._id).select(
        "-refreshToken"
      );

      const options = {
        httpOnly: true,
        secure: true,
      };
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user: loggedInUser,
              accessToken,
              refreshToken,
            },
            "User logged In Successfully"
          )
        );
    }
    return res
      .status(401)
      .json(
        new ApiResponse(400, {}, "User with this mobile number does not exist.")
      );
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to login user", error: err.message });
  }
});


const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.body._id,
    {
      $unset: {
        refreshToken: 1, // This removes the field from the document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.body.refreshToken;
  //  req.cookies.refreshToken ||

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const userProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    return res.status(200).json(
      new ApiResponse(200, {
        user: user,
      })
    );
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message || "Invalid refresh token"));
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const userSchema = Joi.object({
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
      address2: Joi.string().allow(null, ""),
      state: Joi.string().required(),
      country: Joi.string().required(),
      personalInfo: Joi.string().allow(null, ""),
    });

    const { error, value } = userSchema.validate(req.body);

    if (error) {
      return res
        .status(403)
        .json(new ApiResponse(403, error.details[0], "Validation failed."));
    }

    const {
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
    } = req.body;

    let profilePicture;
    if (req.files?.profilePicture?.[0]?.path) {
      const profilePicturePath = req.files.profilePicture[0].path;
      profilePicture = await uploadOnCloudinary(profilePicturePath);
    }

    // Update user fields
    if (profilePicture) user.profilePicture = profilePicture.url || "";
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.gender = gender || user.gender;
    user.birthDay = birthDay || user.birthDay;
    user.bloodGroup = bloodGroup || user.bloodGroup;
    user.address1 = address1 || user.address1;
    user.address2 = address2 || user.address2;
    user.state = state || user.state;
    user.country = country || user.country;
    user.personalInfo = personalInfo || user.personalInfo;

    // Save the updated user
    await user.save();

    return res.status(200).json(new ApiResponse(200, { user: user }));
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message || "Invalid refresh token"));
  }
});

const changePassword = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    const userData = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmNewPassword: Joi.string().required(),
    });

    const { error, value } = userData.validate(req.body);

    if (error) {
      return res
        .status(403)
        .json(new ApiResponse(403, error.details[0], "Validation failed."));
    }

    const { currentPassword, newPassword, confirmNewPassword } = value;

    if (newPassword !== confirmNewPassword) {
      return res
        .status(403)
        .json(
          new ApiError(403, "NewPassword and Confirm New password do not match")
        );
    }

    const passMatch = await bcrypt.compare(currentPassword, user.password);
    if (passMatch) {
      user.password = newPassword;
      // Save the updated user password
      await user.save();

      return res.status(200).json(
        new ApiResponse(200, {
          user: user,
        })
      );
    }
    // return res.status(401).json(new ApiResponse(401, {}, "Incorrect Password"));
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message || "Invalid refresh token"));
  }
});

// pending
// const socialProfile = asyncHandler(async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("-refreshToken");

//     if (!user) {
//       throw new ApiError(401, "Invalid refresh token");
//     }

//     // pending work - complete the below code
//     const userSchema = Joi.object({
//       name: Joi.string().required(),
//       phone: Joi.string().length(10).required(),
//       email: Joi.string().email().required(),
//       gender: Joi.string().valid("Male", "Female", "Other").required(),
//     });

//     const { error, value } = userSchema.validate(req.body);

//     if (error) {
//       return res
//         .status(403)
//         .json(new ApiResponse(403, error.details[0], "Validation failed."));
//     }

//     const {
//       name,
//       phone,
//       email,
//       gender,
//     } = req.body;

//     user.name = name || user.name;

//     // Save the updated user
//     await user.save();

//     return res.status(200).json(new ApiResponse(200, { user: user }));
//   } catch (error) {
//     return res
//       .status(401)
//       .json(new ApiResponse(401, error.message || "Invalid refresh token"));
//   }
// });

export {
  registerUser,
  loginUserByEmail,
  loginUserByPhone,
  logoutUser,
  refreshAccessToken,
  userProfile,
  updateProfile,
  changePassword,
};
