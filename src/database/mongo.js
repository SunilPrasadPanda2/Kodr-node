import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbUri = `${process.env.MONGO_URI}/${process.env.DB_NAME}`;
    const connectionInstance = await mongoose.connect(dbUri);
    console.log(
      `\n Mongodb connected ! DBHOST : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB connection failed: " + error);
    process.exit(1);
  }
};

export default connectDB;
