import { Schema } from "mongoose";
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

const adminSchema = new Schema(
  {
    profilePicture: {
      type: String,
      required: false,
    },
    birthDay: {
      type: Date,
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
      required: false, // Set to false if the entire socialProfile is required
    },
  },
  {
    timestamps: true,
  }
);
const Admin = User.discriminator("Admin", adminSchema);
export default Admin;
