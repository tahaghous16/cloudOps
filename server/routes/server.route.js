import express from "express";

import {
  createServer,
  getServers,
  getServerById,
  deleteServer,
  getServerMetrics,
} from "../controllers/serverController.js";

const router = express.Router();

router.post("/", createServer);

router.get("/", getServers);

router.get("/:id/metrics", getServerMetrics);

router.get("/:id", getServerById);

router.delete("/:id", deleteServer);

export default router;
