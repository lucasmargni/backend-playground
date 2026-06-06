import { Request, Response, NextFunction } from "express";
import { JWTPayload } from "../types/index.js";
import { findUserById } from "../repository/user.repository.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers.authorization || "";

  if (!auth) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }

  /* auth = Bearer <token> */
  const token = auth.split(" ")[1];

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JWTPayload;

    const user = await findUserById(payload.userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    req.user = user;

    next();
  } catch {
    res.status(401).json({ error: "User is not authenticated" });
    return;
  }
};
