import mongoose, { Schema } from "mongoose";

const lessonSchema = new Schema({
  title: { type: String, required: false },
  videos: { type: String, required: false },
  duration: { type: String, required: false },
});

const sectionSchema = new Schema({
  title: { type: String, required: true },
  numberOfLessons: { type: Number, required: false },
  duration: { type: String, required: false },
  description: { type: String, required: false },
  lessons: [lessonSchema],
});

const courseSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  courseName: { type: String, required: true },
  courseImage: {
    type: String,
    required: false,
  },
  description: { type: String, required: true },
  longDescription: { type: String, required: true },
  studentsEnrolled: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  closeCaption: { type: String, required: false },
  author: { type: String, required: true },
  aboutAuthor: { type: String, required: true },
  sections: [sectionSchema],
  numberOfSections: { type: Number, required: false },
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
