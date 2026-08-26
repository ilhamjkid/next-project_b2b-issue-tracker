import NextAuth, { AuthError } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signinFormSchema } from "@/features/auth/schemas";
import { getUserByEmail } from "@/features/users/queries";
import { comparePassword } from "@/lib/password";

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
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

        const userResult = await getUserByEmail({
          userEmail: validatedFieldsResult.data.email,
          output: "ALL_FIELDS",
        });
        if (!userResult.success) {
          if (userResult.message) return null;
          throw new AuthError("Internal Server Error");
        }

        const { id, name, email, password_hash, role } = userResult.data;

        const passwordComparisonResult = await comparePassword(
          validatedFieldsResult.data.password,
          password_hash,
        );
        if (!passwordComparisonResult.success) {
          throw new AuthError("Internal Server Error");
        }
        if (passwordComparisonResult.data === false) return null;

        return { id, name, email, role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      if (trigger === "update" && session?.user) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.email) token.email = session.user.email;
        if (session.user.role) token.role = session.user.role;
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
