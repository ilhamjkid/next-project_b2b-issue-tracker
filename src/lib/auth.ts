import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signinFormSchema } from "@/features/auth/schemas";
import { getSingleUser } from "@/features/auth/queries";
import { comparePassword } from "@/lib/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
          required: true,
        },
        password: {
          type: "password",
          required: true,
        },
      },
      async authorize(credentials) {
        const validatedFieldsResult = signinFormSchema.safeParse(credentials);
        if (!validatedFieldsResult.success) return null;

        const userResult = await getSingleUser({
          where: { email: validatedFieldsResult.data.email },
          output: { id: true, name: true, email: true, password_hash: true, role: true },
        });
        if (!userResult.success) return null;
        if (userResult.data === null) return null;

        const user = userResult.data;

        const passwordComparisonResult = await comparePassword(
          validatedFieldsResult.data.password,
          user.password_hash,
        );
        if (!passwordComparisonResult.success) return null;
        if (passwordComparisonResult.data === false) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
