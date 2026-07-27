import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

console.log("[AXIOS CONFIG] N8N_WEBHOOK_URL resolved to:", process.env.N8N_WEBHOOK_URL || "NOT SET ⚠️");

export const n8nClient = axios.create({
  baseURL: process.env.N8N_WEBHOOK_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
