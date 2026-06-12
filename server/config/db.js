import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.URI}/cloudOps`,
    );
    console.log(
      `\n MongoDB conected ! DB Host: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("MONGODB main masla hai!", error.message);
    process.exit(1);
  }
};

export default connectDB;
