import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const authRouter = Router();

// Login endpoint
authRouter.post('/login', AuthController.login);

// Signup endpoint
authRouter.post('/signup', AuthController.signup);


// Reset password endpoint
authRouter.post('/reset-password', AuthController.resetPassword);

//Test endpoint to check if the user is authenticated
authRouter.get('/test', AuthController.test);

authRouter.get('/verify-token', verifyToken, AuthController.verifyToken);
authRouter.post('logout',AuthController.logout);

export default authRouter;
