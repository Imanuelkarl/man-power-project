import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const authRouter = Router();

// Login endpoint
authRouter.post('/login', AuthController.login);

// Signup endpoint
authRouter.post('/signup', verifyToken, adminOnly, AuthController.signup);


// Reset password endpoint
authRouter.post('/update-password', AuthController.resetPassword);

//Create password reset request
authRouter.post('/reset-password', AuthController.requestResetPassword);

//Test endpoint to check if the user is authenticated
authRouter.get('/test', AuthController.test);

authRouter.get('/verify-token', verifyToken, AuthController.verifyToken);
authRouter.post('/logout', AuthController.logout);

export default authRouter;
