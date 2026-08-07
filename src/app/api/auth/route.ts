import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

// PBKDF2 Password Hashing Helpers
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

import { getCookieDomain } from "@/lib/cookie-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, username, email, password, googleCredential } = body;

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const cookieStore = await cookies();
    const domain = getCookieDomain(request);

    if (action === "logout") {
      cookieStore.set({
        name: "user_session",
        value: "",
        domain,
        path: "/",
        maxAge: 0,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "register") {
      if (!username || !email || !password) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
      }

      // Generate salt and hash the password
      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);

      const newUser = {
        username,
        email,
        passwordHash,
        salt,
        picture: "",
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      const userPayload = {
        id: result.insertedId.toString(),
        username,
        email,
        picture: "",
      };

      cookieStore.set({
        name: "user_session",
        value: JSON.stringify(userPayload),
        domain,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return NextResponse.json({ success: true, user: userPayload });
    }

    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
      }

      const user = await usersCollection.findOne({ email });
      if (!user || !user.salt || !user.passwordHash) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
      }

      // Verify the password
      const incomingHash = hashPassword(password, user.salt);
      if (incomingHash !== user.passwordHash) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
      }

      const userPayload = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        picture: user.picture || "",
      };

      cookieStore.set({
        name: "user_session",
        value: JSON.stringify(userPayload),
        domain,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return NextResponse.json({ success: true, user: userPayload });
    }

    // Google JWT Login / Register
    if (action === "google") {
      if (!googleCredential) {
        return NextResponse.json({ error: "Missing Google credential token" }, { status: 400 });
      }

      // Safe client-side payload decode (Google credential JWT is a 3-part base64 string)
      const tokenParts = googleCredential.split(".");
      if (tokenParts.length !== 3) {
        return NextResponse.json({ error: "Invalid Google credential format" }, { status: 400 });
      }

      const payloadBuf = Buffer.from(tokenParts[1], "base64");
      const googleUser = JSON.parse(payloadBuf.toString("utf-8"));

      if (!googleUser.email || !googleUser.name) {
        return NextResponse.json({ error: "Invalid Google token payload" }, { status: 400 });
      }

      // Check if user exists by google email
      let user = await usersCollection.findOne({ email: googleUser.email });
      
      if (!user) {
        // Auto-create profile
        const newUser = {
          username: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.sub,
          provider: "google",
          picture: googleUser.picture || "",
          createdAt: new Date(),
        };
        const result = await usersCollection.insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
      } else {
        // Ensure provider is set to google and update picture
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { provider: "google", ...(googleUser.picture ? { picture: googleUser.picture } : {}) } }
        );
        user.provider = "google";
        if (googleUser.picture) user.picture = googleUser.picture;
      }

      const userPayload = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        picture: user.picture || "",
      };

      cookieStore.set({
        name: "user_session",
        value: JSON.stringify(userPayload),
        domain,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return NextResponse.json({ success: true, user: userPayload });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
