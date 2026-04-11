import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable inside .env.local");
}

/**
 * Generate JWT token and set it as an HTTP-only cookie
 */
export function generateToken(userId, cookieStore) {
  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  // Set httpOnly cookie (more secure)
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  });

  return token;
}

/**
 * Verify JWT token from cookies
 * Returns userId if valid, null if invalid
 */
export function verifyToken(cookieStore) {
  try {
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

/**
 * Clear authentication cookie
 */
export async function clearToken(response) {
  // If response is provided (NextResponse), set cookie on response
  if (response) {
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
  } else {
    // Otherwise use cookies() for direct cookie manipulation
    const cookieStore = await cookies();
    cookieStore.delete("token");
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compare password with hashed password
 */
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Middleware to protect API routes
 * Use this in API route handlers to ensure user is authenticated
 */
export async function requireAuth() {
  const cookieStore = await cookies();
  const userId = verifyToken(cookieStore);
  
  if (!userId) {
    return { authenticated: false, userId: null };
  }
  
  return { authenticated: true, userId };
}
