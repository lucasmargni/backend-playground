import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validate } from "../validators/validate.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);

export default authRouter;
