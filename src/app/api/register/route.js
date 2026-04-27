import { User } from "@/models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  await mongoose.connect(process.env.MONGODB_URI);
  const body = await req.json();
  const pass = body.password;

  if (!body.email || !EMAIL_RE.test(body.email)) {
    return new Response(JSON.stringify({ error: "Invalid email address" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!pass || pass.length < 5) {
    return new Response(JSON.stringify({ error: "Password must be at least 5 characters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const salt = bcrypt.genSaltSync(10);
  body.password = bcrypt.hashSync(pass, salt);

  try {
    const createdUser = await User.create(body);
    return new Response(JSON.stringify(createdUser), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err.code === 11000) {
      return new Response(JSON.stringify({ error: "Email already registered" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
