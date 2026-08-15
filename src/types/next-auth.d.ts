import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: "CLIENT" | "AGENT";
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "CLIENT" | "AGENT";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: "CLIENT" | "AGENT";
  }
}
