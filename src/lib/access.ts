import { redirect, RedirectType } from "next/navigation";
import { UserEntity } from "@/features/users/types";
import { Prettify } from "@/lib/types";
import { auth } from "@/lib/auth";

type AuthUser = Prettify<Pick<UserEntity, "id" | "name" | "email" | "role">>;
type AuthClientUser = Prettify<Omit<AuthUser, "role"> & { role: "CLIENT" }>;
type AuthAgentUser = Prettify<Omit<AuthUser, "role"> & { role: "AGENT" }>;

/**
 * Enforces user authentication and returns a general authenticated user object.
 * Redirects to the sign-in page if no active session is found.
 */
export async function requireAuth(userRole?: undefined): Promise<AuthUser>;

/**
 * Enforces user authentication and restricts access exclusively to users with the 'CLIENT' role.
 * Redirects to the agent portal if the authenticated user is an AGENT.
 */
export async function requireAuth(userRole: AuthClientUser["role"]): Promise<AuthClientUser>;

/**
 * Enforces user authentication and restricts access exclusively to users with the 'AGENT' role.
 * Redirects to the client dashboard if the authenticated user is a CLIENT.
 */
export async function requireAuth(userRole: AuthAgentUser["role"]): Promise<AuthAgentUser>;

/**
 * requireAuth
 *
 * A specialized server-side middleware utility designed to guard Next.js App Router Server Actions
 * and Server Components against unauthorized or forbidden role access.
 *
 * How it works under the hood:
 * 1. SESSION CHECK: It fetches the session using `auth()`. If absent, it triggers a server-side redirect to `/signin`.
 * 2. ROLE PASS-THROUGH: If no specific `userRole` restriction is requested (`undefined`), it directly grants access and yields the general user payload.
 * 3. AUTHORIZATION CHECK: If a role constraint is given, it validates the authenticated user's role. If matched, it typecasts and returns the narrowed user variant.
 * 4. CROSS-REDIRECT LAW: If a cross-role breach occurs, it redirects the intruder back to their respective authorized home directory.
 */
export async function requireAuth(userRole?: AuthUser["role"]): Promise<AuthUser> {
  const session = await auth();

  if (!session) return redirect("/signin", RedirectType.replace);

  const { user } = session;

  if (userRole === undefined) return user;

  if (userRole === user.role) return user;

  redirect(userRole === "AGENT" ? "/client" : "/agent", RedirectType.replace);
}
