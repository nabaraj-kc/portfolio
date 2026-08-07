import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, countryCode, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const gmailUser = process.env.GMAIL_USER || "nabarajkc43@gmail.com";
    const gmailAppPassword =
      process.env.GMAIL_APP_PASSWORD || "ebyuorjsfcuzrzwe";

    // Configure Nodemailer transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword.replace(/\s+/g, ""),
      },
    });

    const formattedPhone = phone ? `${countryCode || "+977"} ${phone}` : "Not provided";

    const mailOptions = {
      from: `"Portfolio Contact Form" <${gmailUser}>`,
      to: "nabarajkc43@gmail.com",
      replyTo: email,
      subject: `New Portfolio Message from ${name}`,
      text: `You received a new message from your portfolio website (nabarajkc.com.np):\n\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Phone: ${formattedPhone}\n\n` +
        `Message:\n${message}\n\n` +
        `Sent at: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })} (NPT)`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #202020; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 8px;">
          <h2 style="color: #C85A17; border-bottom: 2px solid #C85A17; padding-bottom: 8px;">
            New Portfolio Message
          </h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${formattedPhone}</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <h3 style="color: #202020;">Message:</h3>
          <p style="background-color: #f5f1e8; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${message}</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #8F8F8F;">
            Sent from portfolio website • ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })} (NPT)
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Also save message to MongoDB for admin inbox
    try {
      const { default: clientPromise } = await import("@/lib/mongodb");
      const client = await clientPromise;
      const db = client.db();
      
      await db.collection("messages").insertOne({
        id: Date.now().toString(),
        name,
        email,
        phone: phone ? `${countryCode || "+977"} ${phone}` : "",
        message,
        receivedAt: new Date().toISOString(),
        read: false,
      });
    } catch (e) {
      console.error("Failed to save message to MongoDB:", e);
      // Silent fail — email already sent, don't block response
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully to your Gmail inbox.",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Gmail SMTP Send Error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to send email message.", details: errorMessage },
      { status: 500 }
    );
  }
}
