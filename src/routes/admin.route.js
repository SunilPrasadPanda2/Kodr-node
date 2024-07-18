import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { trainers, students } from "../controllers/admin.controller.js";

const router = Router();
router.route("/trainers").get(verifyJWT, trainers);
router.route("/students").get(verifyJWT, students);
export default router;
