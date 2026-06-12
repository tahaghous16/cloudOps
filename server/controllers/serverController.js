import Server from "../models/server.model.js";
import axios from "axios";

// Add Server
export const createServer = async (req, res) => {
  try {
    const { name, publicIp, environment } = req.body;

    const server = await Server.create({
      name,
      publicIp,
      environment,
    });

    res.status(201).json(server);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Servers
export const getServers = async (req, res) => {
  try {
    const servers = await Server.find();

    res.status(200).json(servers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Server
export const getServerById = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);

    if (!server) {
      return res.status(404).json({
        message: "Server not found",
      });
    }

    res.status(200).json(server);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Server
export const deleteServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);

    if (!server) {
      return res.status(404).json({
        message: "Server not found",
      });
    }

    await server.deleteOne();

    res.status(200).json({
      message: "Server deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



// Get Server Metrics
export const getServerMetrics = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);

    if (!server) {
      return res.status(404).json({
        message: "Server not found",
      });
    }

    const response = await axios.get(
      `http://${server.publicIp}:8000/metrics`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};