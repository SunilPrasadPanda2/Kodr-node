import { Schema } from "mongoose";
import User from "./users.model.js";

// Define a schema for social profiles
const socialProfileSchema = new Schema(
  {
    twitter: {
      type: String,
      required: false, // Set to true if required
    },
    facebook: {
      type: String,
      required: false, // Set to true if required
    },
    instagram: {
      type: String,
      required: false, // Set to true if required
    },
    linkedin: {
      type: String,
      required: false, // Set to true if required
    },
  },
  { _id: false }
); // Disables the automatic generation of _id field

const adminSchema = new Schema(
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
      required: false, // Set to true if the entire socialProfile is required
    },
  },
  {
    timestamps: true,
  }
);
const Admin = User.discriminator("Admin", adminSchema);
export default Admin;
