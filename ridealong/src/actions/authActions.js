"use server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { comparePassword, generateToken, hashPassword } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Server Action for Logging In
 */
export async function loginAction(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let success = false;
  try {
    await connectDB();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return { error: "Invalid Credentials" };
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return { error: "Invalid Credentials" };
    }

    // Set JWT Cookie
    const cookieStore = await cookies();
    generateToken(user._id.toString(), cookieStore);

    success = true;
  } catch (error) {
    console.error("Login Action Error:", error);
    return { error: error.message || "Server Error" };
  }

  if (success) {
    redirect("/dashboard");
  }
}

/**
 * Server Action for Registering 
 */
export async function signupAction(prevState, formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const gender = formData.get("gender");

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  let success = false;
  try {
    await connectDB();

    // Check existing
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "Email already registered" };
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      gender: gender || "male",
    });

    // Set JWT Cookie automatically upon signup
    const cookieStore = await cookies();
    generateToken(newUser._id.toString(), cookieStore);

    success = true;
  } catch (error) {
    console.error("Signup Action Error:", error);
    return { error: error.message || "Server Error" };
  }

  if (success) {
    redirect("/dashboard");
  }
}

/**
 * Server Action for Reset Password
 */
export async function resetPasswordAction(formData) {
  const email = formData.get("email");
  const newPassword = formData.get("newPassword");

  if (!email || !newPassword) {
    return { error: "All fields are required" };
  }

  try {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return { error: "User not found" };
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return { success: true, message: "Password reset successful!" };
  } catch (error) {
    return { error: error.message || "Server Error" };
  }
}

/**
 * Server Action for Logging Out with Cache Revalidation
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  
  // Wipe both the Server Router cache and Client Router memory across all paths
  revalidatePath("/", "layout");
  
  redirect("/login");
}
