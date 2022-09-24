import { Request, Response } from "express";
import { UserModel } from "../../core/models/UserModel";
import { prisma } from "../../api/middlewares/prisma/PrismaClient";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function Authenticated(req: Request, res: Response) {
  const { email, password }: UserModel = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Campos obrigatórios" });

  const userSearched = await prisma.user.findUnique({ where: { email } });

  if (!userSearched) {
    return res.status(400).json({ message: "Email ou senha incorreto" });
  }

  const passwordMatch = await compare(password, userSearched.password);

  if (!passwordMatch) {
    return res.status(400).json({ message: "Email ou senha incorreto" });
  }

  const key = process.env.KEY!;

  const token = sign({}, key, {
    subject: userSearched.id,
    expiresIn: 120,
  });

  return res.status(200).json({ token });
}