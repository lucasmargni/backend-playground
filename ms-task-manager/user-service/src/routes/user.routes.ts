import { Router } from "express";
import { getUserById, validateToken } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/validate", isAuthenticated, validateToken);
userRouter.get("/:id", getUserById);

export default userRouter;
