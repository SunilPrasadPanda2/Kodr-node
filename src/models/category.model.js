import mongoose, { Schema } from "mongoose";

// const subCategorySchema = new Schema({
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   trainers: [
//     {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: false,
//     },
//   ],
// });

const categorySchema = new Schema({
  name: { type: String, required: true },
  //   subcategories: [subCategorySchema],
});

const Category = new mongoose.model("Category", categorySchema);

export default Category;
