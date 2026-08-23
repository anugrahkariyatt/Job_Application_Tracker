import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.config.js";
import { redis } from "./config/redis.config.js";

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();

    try {
      await redis.connect();
      const pingResult = await redis.ping();
      console.log(`Connected to Redis Docker container! PING response: ${pingResult}`);
    } catch (redisErr: any) {
      console.warn("Could not connect to Redis server, running with fallback mode:", redisErr.message);
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
