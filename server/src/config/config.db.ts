import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoURI = process.env.MONGODB_URI;
console.log(mongoURI);

if (!mongoURI) {
  throw new Error("MONGODB_URI is not defined in .env");
}
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Successfully connected to MongoDB ");
  } catch (err) {
    console.error("Connection failed", err);
    process.exit(1);
  }
};
export default connectDB;
