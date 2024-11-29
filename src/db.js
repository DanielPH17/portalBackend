import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.REACT_APP_URL_DB);
    console.log("DB is connected");
  } catch (error) {
    console.log(error);
  }
};
