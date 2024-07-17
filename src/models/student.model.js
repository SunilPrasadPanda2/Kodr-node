import mongoose, { Schema } from "mongoose";
import User from "./users.model.js";

const StudentSchema = new Schema(
  {
    profilePicture: {
      type: String,
      required: false,
    },
    dob: {
      type: Date,
      required: false,
    },
    myCourses: {
      type: Array,
      required: false,
    },
    bloodGroup: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Student = User.discriminator("Student", StudentSchema);

export default Student;
