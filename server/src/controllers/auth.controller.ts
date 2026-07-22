import { Request, Response } from "express";
import { AuthService } from "../services/auth.services.js";

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
          message: "Email and password are required",
        });
        return;
      }

      // TODO: Implement login logic
      const { token, user } = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Login failed",
        error,
      });
    }
  }

  /**
   * Sign up with name, email, password, and role (manufacturer or investor)
   */
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role , companyName } = req.body;

      // Validate input
      if (!name || !email || !password || !role) {
        res.status(400).json({
          success: false,
          message: "name, email, password, and role are required",
        });
        return;
      }

      // Validate role
      if (!["manufacturer", "investor","admin"].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Role must be either "manufacturer" or "investor"',
        });
        return;
      }
      if (role==="manufacturer"&&!companyName) {
        res.status(400).json({
          success: false,
          message: '"Company Name is required to create manufacturer"',
        });
        return;
      }
      
      

      // TODO: Implement signup logic
      const { token, user ,manufacturer } = await AuthService.signup({
        name: name,
        email: email,
        password: password,
        role: role,
        companyName: companyName,
      });

      res.status(201).json({
        success: true,
        message: "Sign up successful",
        data: {
          token,
          user,
          manufacturer
        },
      });
    } catch (error:any) {
      console.error("Error during signup:", error);
      res.status(400).json({
        success: false,
        message:  error.message
      });
    }
  }
  /**
   * Create Reset password request
   */
  static async requestResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Validate input
      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }
      await AuthService.createPasswordResetRequest(email);

      res.status(200).json({
        success: true,
        message: "Password reset request has been sent successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to send password reset request",
        error,
      });
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      // Validate input
      if (!token || !password) {
        console.error(`Token and new password are required token is ${token} and password is ${password}`);
        res.status(400).json({
          success: false,
          message: "Token and new password are required",
        });
        return;
      }
      await AuthService.resetPassword(token,password);

      res.status(200).json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Password reset failed",
        error,
      });
    }
  }
  static async test(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: "User is authenticated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Test endpoint failed",
        error,
      });
    }
  }
  static async verifyToken(req: Request, res: Response): Promise<void> {
    
    try {
      const token = req.headers.authorization?.split(' ')[1];
      console.log(token);
      if(!token){
        return;
      }
      const user = await AuthService.verifyUser(token);
      res.status(200).json({
        success: true,
        message: "Token is valid",
        data: { user },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
        error,
      });
    }
  }
  static async logout(req:Request ,res: Response): Promise<void> {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        return;
      }
    return await AuthService.logout(token)
  }
}