import { Router } from 'express';
import { ManufacturerController } from '../controllers/manufacturer.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { adminOnly, manufacturerOnly } from '../middlewares/role.middleware.js';

const manufacturerRouter = Router();

// Create a new manufacturer
manufacturerRouter.post('/', verifyToken, adminOnly, ManufacturerController.create);

// Get all manufacturers
manufacturerRouter.get('/', verifyToken, ManufacturerController.findAll);

// Get manufacturer by ID
manufacturerRouter.get('/:id', verifyToken, ManufacturerController.findById);

// Get manufacturer by email
manufacturerRouter.get('/email/:email', verifyToken, ManufacturerController.findByEmail);

// Update a manufacturer
manufacturerRouter.put('/:id', verifyToken, manufacturerOnly, ManufacturerController.update);

// Delete a manufacturer
manufacturerRouter.delete('/:id', verifyToken, ManufacturerController.delete);

export default manufacturerRouter;
