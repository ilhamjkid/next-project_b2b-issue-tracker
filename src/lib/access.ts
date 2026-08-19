import { redirect, RedirectType } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireAuth(userRole: "CLIENT"): Promise<{
  id: string;
  name: string;
  email: string;
  role: "CLIENT";
}>;
export async function requireAuth(userRole: "AGENT"): Promise<{
  id: string;
  name: string;
  email: string;
  role: "AGENT";
}>;
export async function requireAuth(userRole?: undefined): Promise<{
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "AGENT";
}>;

export async function requireAuth(userRole?: "CLIENT" | "AGENT" | undefined): Promise<{
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "AGENT";
}> {
  const session = await auth();

  if (!session) return redirect("/signin", RedirectType.replace);

  const { user } = session;

  if (userRole === undefined) return user;

  if (userRole === user.role) return user;

  redirect(userRole === "AGENT" ? "/client" : "/agent", RedirectType.replace);
}
