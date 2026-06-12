import mongoose from "mongoose";

const serverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    publicIp: {
      type: String,
      required: true,
    },

    environment: {
      type: String,
      required: true,
      enum: ["Production", "Staging", "Development"],
    },
  },
  {
    timestamps: true,
  }
);

const Server = mongoose.model("Server", serverSchema);

export default Server;