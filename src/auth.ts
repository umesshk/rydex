import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDb from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      async authorize(credentials) {
        const email = credentials.email;
        const password = credentials.password as string;

        if (!email || !password) {
          throw Error("Credentials not provided");
        }

        await connectDb();

        const user = await User.findOne({ email });

        if (!user) {
          throw Error("User dosen't exist");
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) {
          throw Error("Incorrect Password");
        }

        return {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
  },
});
