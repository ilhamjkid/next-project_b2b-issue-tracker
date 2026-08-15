import { redirect, RedirectType } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function RedirectPage() {
  const session = await auth();

  if (session?.user.role === "AGENT") {
    return redirect("/agent", RedirectType.replace);
  }

  if (session?.user.role === "CLIENT") {
    return redirect("/client", RedirectType.replace);
  }

  redirect("/signin", RedirectType.replace);
}
