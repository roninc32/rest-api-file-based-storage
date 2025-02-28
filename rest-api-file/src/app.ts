import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { userRouter } from "./users/users.routes";
import { productRouter } from "./products/product.routes";

// Load environment variables from .env file
dotenv.config();

// Check if PORT environment variable is available
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000; // Fallback to 3000 if not set

if (isNaN(PORT)) {
    console.error('Invalid PORT value specified in environment variables.');
    process.exit(1); // Exit the process if PORT is invalid
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Set up routes
app.use('/', userRouter); // Use the user router
app.use('/', productRouter); // Use the user router

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on Port ${PORT}`);
});