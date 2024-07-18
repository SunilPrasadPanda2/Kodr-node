import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  trainers,
  students,
  addUser,
} from "../controllers/admin.controller.js";

const router = Router();
router.route("/trainers").get(verifyJWT, trainers);
router.route("/students").get(verifyJWT, students);
router.route("/addUser").post(verifyJWT, addUser);
export default router;
