// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongoDB/config.js";

// import SuperAdminRouter from "./routes/superAdminRouter.js"
import firmAdminRouter from "./routes/firmAdminRouter.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config();

// Initialize Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use("/api/v1/superAdmin", SuperAdminRouter)
app.use("/api/v1/firm_admin", firmAdminRouter)


// Server start
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
