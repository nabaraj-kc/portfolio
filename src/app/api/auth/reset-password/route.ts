import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find the reset token
    const resetRecord = await db.collection("password_resets").findOne({ token });

    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      await db.collection("password_resets").deleteOne({ token });
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    // Hash new password
    const salt = generateSalt();
    const passwordHash = hashPassword(newPassword, salt);

    // Update user password
    const result = await db.collection("users").updateOne(
      { email: resetRecord.email },
      { $set: { passwordHash, salt, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Delete the used token
    await db.collection("password_resets").deleteOne({ token });

    return NextResponse.json({ success: true, message: "Password updated successfully. You can now log in." });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password. Please try again." }, { status: 500 });
  }
}
