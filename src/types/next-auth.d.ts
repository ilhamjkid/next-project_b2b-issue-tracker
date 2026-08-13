import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: "CLIENT" | "AGENT";
  }

  interface Session {
    user: {
      id: string;
      role?: "CLIENT" | "AGENT";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "CLIENT" | "AGENT";
  }
}
