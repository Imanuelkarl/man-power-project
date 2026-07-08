import { Request, Response } from 'express';
import { AuthService } from '../services/auth.services.js';

export class AuthController {
  /**
   * Login with email and password
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      // TODO: Implement login logic
      const { token, user } = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error,
      });
    }
  }

  /**
   * Sign up with name, email, password, and role (manufacturer or investor)
   */
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      // Validate input
      if (!name || !email || !password || !role) {
        res.status(400).json({
          success: false,
          message: 'name, email, password, and role are required',
        });
        return;
      }

      // Validate role
      if (!['manufacturer', 'investor','admin'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Role must be either "manufacturer" or "investor"',
        });
        return;
      }

      // TODO: Implement signup logic
        const { token, user } = await AuthService.signup({username: name, password, role});

      res.status(201).json({
        success: true,
        message: 'Sign up successful',
        data: {
          token,
          user,
        },
      });
    } catch (error) {
        console.error('Error during signup:', error);
      res.status(500).json({
        success: false,
        message: 'Sign up failed',
        error,
      });
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      // Validate input
      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Token and new password are required',
        });
        return;
      }

      // TODO: Implement reset password logic
      // - Verify token validity
      // - Find user by token
      // - Hash new password
      // - Update user password
      // - Invalidate token
      // - Return success message

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        error,
      });
    }
  }
  static async test(req: Request, res: Response): Promise<void> {
    try {
        res.status(200).json({
            success: true,
            message: 'User is authenticated',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Test endpoint failed',
            error,
        });
    }
}

}