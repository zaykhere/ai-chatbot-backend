import { login, register } from "../controllers/auth";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export {router as authRouter};