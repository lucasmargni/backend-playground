import { Request, Response } from "express";
import { findUserById } from "../repository/user.repository.js";

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const user = await findUserById(id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { password: pass, ...safeUser } = user;

    res.status(200).json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const validateToken = (req: Request, res: Response) => {
  res.json({ valid: true, user: req.user });
};
