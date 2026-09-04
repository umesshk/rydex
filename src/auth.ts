import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDb from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),

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
    async signIn({ user, account }) {
      if (account?.provider == "google") {
        await connectDb();

        const d_user = await User.findOne({ email: user.email });

        if (!d_user) {
          await User.create({
            name: user.name,
            email: user.email,
          });
        }

        user.id = d_user._id;
        user.role = d_user.role;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },

    async session({ token, session }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
});
