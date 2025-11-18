// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongoDB/config.js";

// import SuperAdminRouter from "./routes/superAdminRouter.js"
import emailAccountRouter from "./routes/accountRoutes.js";
import superAdminRouter from "./routes/superAdminRouter.js";





// Load .env
dotenv.config();

// Initialize Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

// app.use("/api/v1/superAdmin", SuperAdminRouter)
app.use("/api/v1/emailSettings", emailAccountRouter)
app.use("/api/v1/superAdmin", superAdminRouter)






// Server start
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
