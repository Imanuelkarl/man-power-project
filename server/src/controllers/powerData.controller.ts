import { Request, Response } from "express";
import { PowerDataService } from "../services/powerData.service.js";

export class PowerDataController {
  /**
   * Create a new power data record
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      // Validate input
      if (!data.manufacturer_id || !data.power_value) {
        res.status(400).json({
          success: false,
          message: "Manufacturer ID and power value are required",
        });
        return;
      }

      const powerData = await PowerDataService.create(data);

      res.status(201).json({
        success: true,
        message: "Power data created successfully",
        data: powerData,
      });
    } catch (error) {
      console.error("Error creating power data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create power data",
        error,
      });
    }
  }

  /**
   * Get power data by ID
   */
  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Power Data ID is required",
        });
        return;
      }

      const powerData = await PowerDataService.findById(Number(id));

      if (!powerData) {
        res.status(404).json({
          success: false,
          message: "Power data not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Power data retrieved successfully",
        data: powerData,
      });
    } catch (error) {
      console.error("Error fetching power data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch power data",
        error,
      });
    }
  }

  /**
   * Get power data by manufacturer ID
   */
  static async findByManufacturerId(req: Request, res: Response): Promise<void> {
    try {
      const { manufacturer_id } = req.params;

      if (!manufacturer_id) {
        res.status(400).json({
          success: false,
          message: "Manufacturer ID is required",
        });
        return;
      }

      const powerDataList = await PowerDataService.findByManufacturerId(Number(manufacturer_id));

      res.status(200).json({
        success: true,
        message: "Power data retrieved successfully",
        data: powerDataList,
      });
    } catch (error) {
      console.error("Error fetching power data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch power data",
        error,
      });
    }
  }

  /**
   * Get all power data records
   */
  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const powerDataList = await PowerDataService.findAll();

      res.status(200).json({
        success: true,
        message: "Power data retrieved successfully",
        data: powerDataList,
      });
    } catch (error) {
      console.error("Error fetching power data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch power data",
        error,
      });
    }
  }

  /**
   * Update a power data record
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Power Data ID is required",
        });
        return;
      }

      const powerData = await PowerDataService.update(Number(id), data);

      res.status(200).json({
        success: true,
        message: "Power data updated successfully",
        data: powerData,
      });
    } catch (error) {
      console.error("Error updating power data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update power data",
        error,
      });
    }
  }

  /**
   * Delete a power data record
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Power Data ID is required",
        });
        return;
      }

      const powerData = await PowerDataService.delete(Number(id));

      res.status(200).json({
        success: true,
        message: "Power data deleted successfully",
        data: powerData,
      });
    } catch (error) {
      console.error("Error deleting power data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete power data",
        error,
      });
    }
  }
}
