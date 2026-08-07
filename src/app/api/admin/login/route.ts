import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";
import { getCookieDomain } from "@/lib/cookie-utils";

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

const SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || "nkc-admin-secret-2026";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "nabarajkc@admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nabarajkc43@gmail.com";

function setAdminCookie(request: Request, response: NextResponse) {
  const domain = getCookieDomain(request);
  response.cookies.set("admin_session", SESSION_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    domain,
  });
  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, googleCredential } = body;

    // ── 1. Classic admin password login ─────────────────────────────
    if (action === "password" || (!action && password)) {
      if (password !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
      }
      return setAdminCookie(request, NextResponse.json({ success: true }));
    }

    // ── 2. Email + password login (email must match ADMIN_EMAIL) ─────
    if (action === "email") {
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
      }
      if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        return NextResponse.json({ error: "This email is not authorized as admin." }, { status: 401 });
      }
      if (password !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
      }
      return setAdminCookie(request, NextResponse.json({ success: true }));
    }

    // ── 3. Google OAuth login (must be admin email) ──────────────────
    if (action === "google") {
      if (!googleCredential) {
        return NextResponse.json({ error: "Missing Google credential." }, { status: 400 });
      }

      const parts = googleCredential.split(".");
      if (parts.length !== 3) {
        return NextResponse.json({ error: "Invalid Google token." }, { status: 400 });
      }

      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
      if (!payload.email) {
        return NextResponse.json({ error: "Cannot read Google account email." }, { status: 400 });
      }

      if (payload.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        return NextResponse.json({
          error: `Google account "${payload.email}" is not authorized as admin.`,
        }, { status: 401 });
      }

      return setAdminCookie(request, NextResponse.json({ success: true }));
    }

    // ── 4. Admin forgot password (sends reset to ADMIN_EMAIL) ────────
    if (action === "forgot") {
      const target = email?.trim().toLowerCase();
      if (!target || target !== ADMIN_EMAIL.toLowerCase()) {
        // Always respond success to prevent enumeration
        return NextResponse.json({ success: true });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const client = await clientPromise;
      const db = client.db();
      await db.collection("admin_resets").deleteMany({});
      await db.collection("admin_resets").insertOne({ token, expiresAt, createdAt: new Date() });

      const host = request.headers.get("host") || "nabarajkc.com.np";
      const protocol = host.startsWith("localhost") ? "http" : "https";
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
      const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      });

      await transporter.sendMail({
        from: `"Nabaraj KC Admin" <${process.env.GMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: "Admin Panel — Password Reset",
        html: `
          <div style="font-family:monospace;max-width:480px;margin:0 auto;padding:32px;background:#F5F1E8;border-radius:12px;">
            <p style="color:#8F8F8F;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">nabarajkc.com.np / admin</p>
            <h2 style="color:#202020;margin:0 0 16px;font-size:18px;">Admin Password Reset</h2>
            <p style="color:#202020;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Click the button below to reset your admin password. This link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="display:inline-block;background:#C85A17;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Reset Admin Password</a>
            <p style="color:#8F8F8F;font-size:11px;margin-top:24px;">Link: ${resetUrl}</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    // ── 5. Admin reset password (validate token → update env not possible; store new hash in DB) ─
    if (action === "reset") {
      const { token, newPassword } = body;
      if (!token || !newPassword) {
        return NextResponse.json({ error: "Token and new password required." }, { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db();
      const record = await db.collection("admin_resets").findOne({ token });

      if (!record || new Date() > new Date(record.expiresAt)) {
        return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
      }

      // Store the new admin password override in DB (checked first before env var)
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = hashPassword(newPassword, salt);
      await db.collection("admin_config").updateOne(
        {},
        { $set: { passwordHash: hash, salt, updatedAt: new Date() } },
        { upsert: true }
      );
      await db.collection("admin_resets").deleteMany({});

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
