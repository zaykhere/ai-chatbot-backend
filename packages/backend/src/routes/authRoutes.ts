import validateRequest from "../middlewares/validateRequest";
import { login, register } from "../controllers/auth";
import { Router } from "express";
import { loginSchema, registerSchema } from "../validators/userValidator";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

export { router as authRouter };