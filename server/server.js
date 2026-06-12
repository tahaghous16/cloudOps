import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import connectDB from "./config/db.js";
import registerRouter from "./routes/auth.route.js";
import serverRoutes from "./routes/server.route.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CloudOps Backend Running");
});

app.use("/api/auth", registerRouter);
app.use("/api/servers", serverRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB();
