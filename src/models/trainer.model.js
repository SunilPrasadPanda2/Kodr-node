import mongoose, { Schema } from "mongoose";
import User from "../models/users.model.js";

const trainerSchema = new Schema(
  {
    profilePicture: {
      type: String,
      required: false,
    },
    myCourses: {
      type: Array,
      required: false,
    },
    dob: {
      type: Date,
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

const Trainer = User.discriminator("Trainer", trainerSchema);

export default Trainer;
