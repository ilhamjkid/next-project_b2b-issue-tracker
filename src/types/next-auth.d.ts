import { DefaultSession } from "next-auth";
import "next-auth/jwt";
import { UserEntity } from "@/features/users/types";

declare module "next-auth" {
  interface User {
    id: UserEntity["id"];
    name: UserEntity["name"];
    email: UserEntity["email"];
    role: UserEntity["role"];
  }

  interface Session {
    user: {
      id: UserEntity["id"];
      name: UserEntity["name"];
      email: UserEntity["email"];
      role: UserEntity["role"];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: UserEntity["id"];
    name: UserEntity["name"];
    email: UserEntity["email"];
    role: UserEntity["role"];
  }
}
