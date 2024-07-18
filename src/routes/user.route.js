import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

// importing controller functions
import {
  registerUser,
  loginUserByEmail,
  validatingPhone,
  validatingOtp,
  logoutUser,
  refreshAccessToken,
  userProfile,
  updateProfile,
  changePassword,
  socialProfiles,
  getSocialProfiles,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/loginWithEmail").post(loginUserByEmail);
router.route("/validatingPhone").post(validatingPhone);
router.route("/validatingOtp").post(verifyJWT, validatingOtp);

router.route("/logout").post(verifyJWT, logoutUser);
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
router.route("/addSocialProfiles").post(verifyJWT, socialProfiles);
router.route("/getSocialProfiles").get(verifyJWT, getSocialProfiles);
export default router;
