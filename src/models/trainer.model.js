import mongoose, { Schema } from "mongoose";
import User from "../models/users.model.js";

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

const trainerSchema = new Schema(
  {
    profilePicture: {
      type: String,
      required: false,
    },
    birthDay: {
      type: String,
      required: false,
    },
    bloodGroup: {
      type: String,
      required: false,
    },
    address1: {
      type: String,
      required: false,
    },
    address2: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    personalInfo: {
      type: String,
      required: false,
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

const Trainer = User.discriminator("Trainer", trainerSchema);

export default Trainer;
