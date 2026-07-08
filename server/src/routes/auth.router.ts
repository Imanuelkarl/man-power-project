import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const authRouter = Router();

// Login endpoint
authRouter.post('/login', AuthController.login);

// Signup endpoint
authRouter.post('/signup', AuthController.signup);


// Reset password endpoint
authRouter.post('/reset-password', AuthController.resetPassword);

//Test endpoint to check if the user is authenticated
authRouter.get('/test', AuthController.test);

export default authRouter;
