import mongoose, { Schema } from "mongoose";
import User from "./users.model.js";

const socialProfileSchema = new Schema(
  {
    twitter: {
      type: String,
      required: false,
    },
    facebook: {
      type: String,
      required: false,
    },
    instagram: {
      type: String,
      required: false,
    },
    linkedin: {
      type: String,
      required: false,
    },
  },
  { _id: false }
);

const StudentSchema = new Schema(
  {
    profilePicture: {
      type: String,
      required: true,
    },
    birthDay: {
      type: Date,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    address1: {
      type: String,
      required: true,
    },
    address2: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    personalInfo: {
      type: String,
      required: true,
    },
    socialProfile: {
      type: socialProfileSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Student = User.discriminator("Student", StudentSchema);

export default Student;
