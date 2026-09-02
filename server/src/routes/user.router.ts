import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/role.middleware.js";

const userRouter = Router();

// Get all users
userRouter.get("/", verifyToken, adminOnly, UserController.findAll);

// Get user by user ID
userRouter.get("/user-id/:userId", verifyToken, UserController.findByUserId);

// Get user by email
userRouter.get("/email/:email", verifyToken, UserController.findByEmail);

// Get user by ID
userRouter.get("/:id", verifyToken, UserController.findById);

// Update a user
userRouter.put("/:id", verifyToken, adminOnly, UserController.update);

// Delete a user
userRouter.delete("/:id", verifyToken, adminOnly, UserController.delete);

export default userRouter;
