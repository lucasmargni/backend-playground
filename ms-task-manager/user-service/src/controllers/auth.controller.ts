import { Request, Response } from "express";
import { LoginBody, RegisterBody } from "../types/index.js";
import {
  createUser,
  findUserByUsername,
} from "../repository/user.repository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
) => {
  try {
    const { username, password, email } = req.body;

    const user = await findUserByUsername(username);

    if (user) {
      res.status(409).json({ error: "User with username already exists" });
      return;
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = await createUser(username, hashedPass, email);

    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    const { password: pass, ...safeUser } = newUser;

    res.status(201).json({ token, user: safeUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await findUserByUsername(username);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const validPass = await bcrypt.compare(password, user.password);

    if (!validPass) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    const { password: pass, ...safeUser } = user;

    res.status(200).json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
