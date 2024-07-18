import mongoose, { Schema } from "mongoose";

const lessonSchema = new Schema({
  title: { type: String, required: true },
  videos: { type: String, required: true },
  duration: { type: String, required: true },
});

const sectionSchema = new Schema({
  title: { type: String, required: true },
  sectionNumber: { type: String, required: true },
  numberOfLessons: { type: Number },
  duration: { type: String, required: true },
  description: { type: String },
  lessons: [lessonSchema],
});

const courseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String },
  studentsEnrolled: { type: Number, default: 0 },
  level: {
    type: String,
    required: true,
    enum: ["beginner level", "intermediate level", "advanced level"],
  },
  whatStudentsLearn: { type: String, required: true },
  requirements: { type: String },
  audio: { type: String },
  closeCaption: { type: String },
  author: { type: String, required: true },
  aboutAuthor: { type: String },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  subCategoryId: {
    type: Schema.Types.ObjectId,
    ref: "SubCategory",
  },
  sections: [sectionSchema],
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
