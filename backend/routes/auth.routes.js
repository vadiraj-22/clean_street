import express from "express";
import { register, login } from "../controller/auth.controller.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);

export default router;