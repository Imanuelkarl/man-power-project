import { Request, Response } from "express";
import { UserService } from "../services/user.service.js";

export class UserController {
	/**
	 * Get user by ID
	 */
	static async findById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			if (!id || Array.isArray(id) || Number.isNaN(Number(id))) {
				res.status(400).json({
					success: false,
					message: "User ID is required",
				});
				return;
			}

			const user = await UserService.findById(Number(id));

			if (!user) {
				res.status(404).json({
					success: false,
					message: "User not found",
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "User retrieved successfully",
				data: user,
			});
		} catch (error) {
			console.error("Error fetching user:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch user",
				error,
			});
		}
	}

	/**
	 * Get user by user ID
	 */
	static async findByUserId(req: Request, res: Response): Promise<void> {
		try {
			const { userId } = req.params;

			if (!userId || Array.isArray(userId)) {
				res.status(400).json({
					success: false,
					message: "User ID is required",
				});
				return;
			}

			const user = await UserService.findByUserId(userId);

			if (!user) {
				res.status(404).json({ success: false, message: "User not found" });
				return;
			}

			res.status(200).json({
				success: true,
				message: "User retrieved successfully",
				data: user,
			});
		} catch (error) {
			console.error("Error fetching user:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch user",
				error,
			});
		}
	}

	/**
	 * Get user by email
	 */
	static async findByEmail(req: Request, res: Response): Promise<void> {
		try {
			const { email } = req.params;

			if (!email || Array.isArray(email)) {
				res.status(400).json({ success: false, message: "Email is required" });
				return;
			}

			const user = await UserService.findByEmail(email);

			if (!user) {
				res.status(404).json({ success: false, message: "User not found" });
				return;
			}

			res.status(200).json({
				success: true,
				message: "User retrieved successfully",
				data: user,
			});
		} catch (error) {
			console.error("Error fetching user:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch user",
				error,
			});
		}
	}

	/**
	 * Get all users
	 */
	static async findAll(_req: Request, res: Response): Promise<void> {
		try {
			const users = await UserService.findAll();
			res.status(200).json({
				success: true,
				message: "Users retrieved successfully",
				data: users,
			});
		} catch (error) {
			console.error("Error fetching users:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch users",
				error,
			});
		}
	}

	/**
	 * Update a user
	 */
	static async update(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			if (!id || Array.isArray(id) || Number.isNaN(Number(id))) {
				res.status(400).json({ success: false, message: "User ID is required" });
				return;
			}

			const user = await UserService.update(Number(id), req.body);
			res.status(200).json({
				success: true,
				message: "User updated successfully",
				data: user,
			});
		} catch (error) {
			console.error("Error updating user:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update user",
				error,
			});
		}
	}

	/**
	 * Delete a user
	 */
	static async delete(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			if (!id || Array.isArray(id) || Number.isNaN(Number(id))) {
				res.status(400).json({ success: false, message: "User ID is required" });
				return;
			}

			const user = await UserService.delete(Number(id));
			res.status(200).json({
				success: true,
				message: "User deleted successfully",
				data: user,
			});
		} catch (error) {
			console.error("Error deleting user:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete user",
				error,
			});
		}
	}
}
