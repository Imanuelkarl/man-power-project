import { Router } from 'express';
import { PowerDataController } from '../controllers/powerData.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { adminOnly, manufacturerOnly } from '../middlewares/role.middleware.js';

const powerDataRouter = Router();

// Create a new power data record
powerDataRouter.post('/', verifyToken, manufacturerOnly, PowerDataController.create);

// Get all power data records
powerDataRouter.get('/', verifyToken, PowerDataController.findAll);

// Get power data by ID
powerDataRouter.get('/:id', verifyToken, PowerDataController.findById);

// Get power data by manufacturer ID
powerDataRouter.get('/manufacturer/:manufacturer_id', verifyToken, PowerDataController.findByManufacturerId);

// Update a power data record
powerDataRouter.put('/:id', verifyToken, manufacturerOnly, PowerDataController.update);

// Delete a power data record
powerDataRouter.delete('/:id', verifyToken, adminOnly, PowerDataController.delete);

export default powerDataRouter;
