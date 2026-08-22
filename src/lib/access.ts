import { redirect, RedirectType } from "next/navigation";
import { UserEntity } from "@/features/users/types";
import { auth } from "@/lib/auth";

type AuthUser = Omit<UserEntity, "password_hash" | "created_at">;
type AuthClientUser = Omit<AuthUser, "role"> & { role: "CLIENT" };
type AuthAgentUser = Omit<AuthUser, "role"> & { role: "AGENT" };

export async function requireAuth(userRole?: undefined): Promise<AuthUser>;
export async function requireAuth(userRole: AuthClientUser["role"]): Promise<AuthClientUser>;
export async function requireAuth(userRole: AuthAgentUser["role"]): Promise<AuthAgentUser>;

export async function requireAuth(userRole?: AuthUser["role"]): Promise<AuthUser> {
  const session = await auth();

  if (!session) return redirect("/signin", RedirectType.replace);

  const { user } = session;

  if (userRole === undefined) return user;

  if (userRole === user.role) return user;

  redirect(userRole === "AGENT" ? "/client" : "/agent", RedirectType.replace);
}
