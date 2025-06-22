import axios from "axios";

// Create the axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://list.tusharsukhwal.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
