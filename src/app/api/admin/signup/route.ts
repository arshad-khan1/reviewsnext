import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

const signupSchema = z.object({
  name: z.string().min(2, "NAME_TOO_SHORT"),
  email: z.string().email("INVALID_EMAIL"),
  phone: z.string().min(10, "INVALID_PHONE"),
  password: z.string().min(8, "PASSWORD_TOO_SHORT"),
  secretCode: z.string(),
});

/**
 * POST /api/admin/signup
 * Private endpoint for creating platform admins.
 * Protected by a secret code matched against environment variables.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { name, email, phone, password, secretCode } = result.data;

    // 1. Verify Secret Code
    const expectedSecret =
      process.env.ADMIN_SIGNUP_SECRET || "RF-ADMIN-2024-SECURE-KEY";
    if (secretCode !== expectedSecret) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Not Authorized to Create Admin" },
        { status: 401 },
      );
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
        isDeleted: false,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          code: "USER_ALREADY_EXISTS",
          message: "A user with this email or phone already exists",
        },
        { status: 409 },
      );
    }

    // 3. Hash Password
    const hashedPassword = await hashPassword(password);

    // 4. Create Admin User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        isAdmin: true,
        isVerified: true, // Manual admin creation is trusted
      },
    });

    return NextResponse.json({
      message: "Admin account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("[ADMIN_SIGNUP]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to create admin account" },
      { status: 500 },
    );
  }
}
