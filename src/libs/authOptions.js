import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/libs/mongoConnect";
import { User } from "@/models/User";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const authOptions = {
  debug: false,
  secret: process.env.SECRET,
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    secret: process.env.SECRET,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "test@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const email = credentials?.email;
        const password = credentials?.password;

        try {
          await mongoose.connect(process.env.MONGODB_URI);
        } catch {
          return null;
        }

        const user = await User.findOne({ email });
        if (!user) return null;

        const passwordOk = bcrypt.compareSync(password, user.password);
        if (!passwordOk) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email,
        };
      },
    }),
  ],
};