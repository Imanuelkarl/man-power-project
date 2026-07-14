import { Request, Response } from "express";
import { ManufacturerService } from "../services/manufacturer.service.js";

export class ManufacturerController {
  /**
   * Create a new manufacturer
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      // Validate input
      if (!data.name || !data.email) {
        res.status(400).json({
          success: false,
          message: "Name and email are required",
        });
        return;
      }

      const manufacturer = await ManufacturerService.create(data);

      res.status(201).json({
        success: true,
        message: "Manufacturer created successfully",
        data: manufacturer,
      });
    } catch (error) {
      console.error("Error creating manufacturer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create manufacturer",
        error,
      });
    }
  }

  /**
   * Get manufacturer by ID
   */
  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Manufacturer ID is required",
        });
        return;
      }

      const manufacturer = await ManufacturerService.findById(Number(id));

      if (!manufacturer) {
        res.status(404).json({
          success: false,
          message: "Manufacturer not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Manufacturer retrieved successfully",
        data: manufacturer,
      });
    } catch (error) {
      console.error("Error fetching manufacturer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch manufacturer",
        error,
      });
    }
  }

  /**
   * Get manufacturer by email
   */
  static async findByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email || Array.isArray(email)) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      const manufacturer = await ManufacturerService.findByEmail(email);

      if (!manufacturer) {
        res.status(404).json({
          success: false,
          message: "Manufacturer not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Manufacturer retrieved successfully",
        data: manufacturer,
      });
    } catch (error) {
      console.error("Error fetching manufacturer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch manufacturer",
        error,
      });
    }
  }

  /**
   * Get all manufacturers
   */
  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const manufacturers = await ManufacturerService.findAll();

      res.status(200).json({
        success: true,
        message: "Manufacturers retrieved successfully",
        data: manufacturers,
      });
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch manufacturers",
        error,
      });
    }
  }

  /**
   * Update a manufacturer
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Manufacturer ID is required",
        });
        return;
      }

      const manufacturer = await ManufacturerService.update(Number(id), data);

      res.status(200).json({
        success: true,
        message: "Manufacturer updated successfully",
        data: manufacturer,
      });
    } catch (error) {
      console.error("Error updating manufacturer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update manufacturer",
        error,
      });
    }
  }

  /**
   * Delete a manufacturer
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Manufacturer ID is required",
        });
        return;
      }

      const manufacturer = await ManufacturerService.delete(Number(id));

      res.status(200).json({
        success: true,
        message: "Manufacturer deleted successfully",
        data: manufacturer,
      });
    } catch (error) {
      console.error("Error deleting manufacturer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete manufacturer",
        error,
      });
    }
  }
}
