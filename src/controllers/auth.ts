import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { generateToken } from '../utils/token';
import { getDb } from '../db';
import { users } from "../db/schema";
import { sendError, sendSuccess } from '../utils/response';

const db = getDb();

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  const userExists = await db.select().from(users).where(eq(users.email, email));

  if (userExists) {
    sendError(res, "User already exists", 400);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ name, email, password: hashedPassword })
    .returning();
  const token = generateToken({ id: user.id, email: user.email })
  sendSuccess(res, { token, user: { id: user.id, name: user.name, email: user.email } }, 200);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (!user || !(await bcrypt.compare(password, user.password))) {
    sendError(res, "Invalid credentials", 400);
  }
  const token = generateToken({ id: user.id, email: user.email })
  sendSuccess(res, { token, user: {id: user.id, email: user.email, name: user.name} }, 200);

}