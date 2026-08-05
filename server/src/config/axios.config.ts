import axios from "axios";
import dotenv from "dotenv";

dotenv.config();


export const n8nClient = axios.create({
  baseURL: process.env.N8N_WEBHOOK_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
// Add Secret Key 
n8nClient.interceptors.request.use((config) => {
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
  if (webhookSecret) {
    config.headers["x-webhook-secret"] = webhookSecret;
  }
  return config;
});