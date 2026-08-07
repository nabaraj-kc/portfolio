import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent user enumeration
    if (!user) {
      return NextResponse.json({ success: true, message: "If that email is registered, a reset link has been sent." });
    }

    // Generate a secure reset token (expires in 1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in DB
    await db.collection("password_resets").deleteMany({ email }); // remove any old tokens
    await db.collection("password_resets").insertOne({ email, token, expiresAt, createdAt: new Date() });

    // Send email
    const host = request.headers.get("host") || "nabarajkc.com.np";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const displayName = user.username || user.name || "there";

    await transporter.sendMail({
      from: `"Nabaraj KC Platform" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your password — nabarajkc.com.np",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#F5F1E8;font-family:'Helvetica Neue',Arial,sans-serif;">
          <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid rgba(143,143,143,0.2);">
            <div style="background:#202020;padding:28px 32px;">
              <p style="margin:0;font-family:monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#8F8F8F;">nabarajkc.com.np</p>
              <h1 style="margin:8px 0 0;color:#F5F1E8;font-size:20px;font-weight:500;">Reset your password</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#202020;font-size:15px;line-height:1.6;margin:0 0 20px;">Hi ${displayName},</p>
              <p style="color:#202020;font-size:15px;line-height:1.6;margin:0 0 28px;">
                We received a request to reset the password for your account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
              </p>
              <a href="${resetUrl}" style="display:inline-block;background:#C85A17;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.02em;">Reset Password</a>
              <p style="color:#8F8F8F;font-size:12px;margin:24px 0 0;line-height:1.6;">
                If you didn't request this, ignore this email. Your password will not change.<br>
                Or copy this link: <span style="color:#C85A17;word-break:break-all;">${resetUrl}</span>
              </p>
            </div>
            <div style="padding:16px 32px;border-top:1px solid rgba(143,143,143,0.15);">
              <p style="margin:0;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#8F8F8F;">© Nabaraj KC — nabarajkc.com.np</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true, message: "If that email is registered, a reset link has been sent." });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process reset request. Please try again." }, { status: 500 });
  }
}
