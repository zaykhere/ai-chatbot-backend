import jwt from 'jsonwebtoken';

export function generateToken(data: Record<string, any>) {
  return jwt.sign(data, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  })
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!)
}