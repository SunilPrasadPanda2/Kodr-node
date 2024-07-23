import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  trainers,
  students,
  addUser,
  addBanner,
  banners,
  deleteUser,
  viewUser,
} from "../controllers/admin.controller.js";

const router = Router();
router.route("/trainers").get(verifyJWT, trainers);
router.route("/students").get(verifyJWT, students);
router.route("/addUser").post(verifyJWT, addUser);
router.route("/deleteUser").delete(verifyJWT, deleteUser);
router.route("/viewUser").get(verifyJWT, viewUser);
router.route("/addBanner").post(
  verifyJWT,
  upload.fields([
    {
      name: "bannerImage",
      maxCount: 1,
    },
  ]),
  addBanner
);
router.route("/banners").get(verifyJWT, banners);
export default router;
