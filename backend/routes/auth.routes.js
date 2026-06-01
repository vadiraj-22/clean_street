import express from "express";
import { register, login, googleLogin } from "../controller/auth.controller.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/google', googleLogin);

export default router;