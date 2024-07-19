import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/users.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    // req.cookies?.accessToken ||
    // console.log("access token",token);
    if (!token) {
      // throw new ApiError(
      //   401, "access token not provided, Unauthorized request"
      // );

      return res
        .status(401)
        .json(
          new ApiResponse(
            401,
            {},
            "access token not provided, Unauthorized request"
          )
        );
    }
    // const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json(new ApiResponse(401, {}, "access token expired"));
      } else {
        return res
          .status(401)
          .json(new ApiResponse(401, {}, "Invalid access token"));
      }
    }
    const user = await User.findById(decodedToken?._id).select("-refreshToken");
    if (!user) {
      // throw new ApiError(401, "Invalid Access Token");
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "access token expired"));
    }

    req.user = user;
    next();
  } catch (error) {
    // throw new ApiError(401, error?.message || "Invalid access token");
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Invalid access token"));
  }
});

export default verifyJWT;
