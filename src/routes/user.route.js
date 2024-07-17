import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

// importing controller functions
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  userProfile,
  updateProfile,
  changePassword,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/profile").get(verifyJWT, userProfile);
router.route("/updateProfile").post(
  verifyJWT,
  upload.fields([
    {
      name: "profilePicture",
      maxCount: 1,
    },
  ]),
  updateProfile
);
router.route("/changePassword").post(verifyJWT, changePassword);
export default router;
