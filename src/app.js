import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// importing routes
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import trainerRoute from "./routes/trainer.route.js";
import studentRoute from "./routes/student.route.js";

const app = express();
app.use(
  cors({
    orgin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use("/trainer", trainerRoute);
app.use("/student", studentRoute);

export default app;
