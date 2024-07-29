import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { banners } from "../controllers/student/student.controller.js";
const router = Router();
//banner routes
router.route("/banners").get(verifyJWT, banners);
export default router;
