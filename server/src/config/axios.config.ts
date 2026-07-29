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
