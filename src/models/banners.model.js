import mongoose, { Schema } from "mongoose";

const bannerSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    bannerImage: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    offer: {
      type: String,
      required: false,
      default: '0',
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model("Banners", bannerSchema);
export default Banner;
