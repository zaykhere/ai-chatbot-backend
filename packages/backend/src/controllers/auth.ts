import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { users } from "../db/schema";
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { sendError, sendSuccess } from '../utils/response';

const db = getDb();

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;

  const userExists = await db.select().from(users).where(eq(users.email, email));

  if (userExists) {
    sendError(res, "User already exists", 400);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ email, password: hashedPassword })
    .returning();
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
  sendSuccess(res, {token}, 200);

}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
  sendSuccess(res, {token}, 200);

}