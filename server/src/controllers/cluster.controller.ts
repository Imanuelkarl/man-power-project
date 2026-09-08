import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { ClusterInput, ClusterService } from "../services/cluster.service.js";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const parseInput = (body: unknown): ClusterInput | null => {
  if (!body || typeof body !== "object") return null;
  const input = body as Partial<ClusterInput>;
  if (
    typeof input.id !== "string" ||
    typeof input.name !== "string" ||
    !input.name.trim() ||
    typeof input.geoType !== "string" ||
    !isStringArray(input.regions) ||
    !isStringArray(input.states) ||
    !isStringArray(input.lgas) ||
    !isStringArray(input.wards)
  ) {
    return null;
  }
  return input as ClusterInput;
};

export class ClusterController {
  static async findAll(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user?.userId)
        return res
          .status(401)
          .json({ success: false, message: "Invalid user token" });
      const data = await ClusterService.findAll(
        user.userId,
        user.role === "admin",
      );
      return res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching clusters:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch clusters" });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    const input = parseInput(req.body);
    if (!req.user?.userId)
      return res
        .status(401)
        .json({ success: false, message: "Invalid user token" });
    if (!input)
      return res
        .status(400)
        .json({ success: false, message: "Invalid cluster definition" });
    try {
      const data = await ClusterService.create(req.user.userId, input);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      console.error("Error creating cluster:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to create cluster" });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    const input = parseInput(req.body);
    const id = Array.isArray(req.params.id) ? undefined : req.params.id;
    if (!req.user?.userId)
      return res
        .status(401)
        .json({ success: false, message: "Invalid user token" });
    if (!id || !input || input.id !== id)
      return res
        .status(400)
        .json({ success: false, message: "Invalid cluster definition" });
    try {
      const data = await ClusterService.update(
        req.user.userId,
        id,
        input,
        req.user.role === "admin",
      );
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Cluster not found" });
      return res.json({ success: true, data });
    } catch (error) {
      console.error("Error updating cluster:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update cluster" });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    const id = Array.isArray(req.params.id) ? undefined : req.params.id;
    if (!req.user?.userId)
      return res
        .status(401)
        .json({ success: false, message: "Invalid user token" });
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Cluster id is required" });
    try {
      const deleted = await ClusterService.delete(
        req.user.userId,
        id,
        req.user.role === "admin",
      );
      if (!deleted)
        return res
          .status(404)
          .json({ success: false, message: "Cluster not found" });
      return res.json({ success: true, message: "Cluster deleted" });
    } catch (error) {
      console.error("Error deleting cluster:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete cluster" });
    }
  }
}
