import Link from "next/link";
import { HelpCircleIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function RootNotFound() {
  const session = await auth();
  const isLoggedIn = !!session;
  const isAgent = session?.user.role === "AGENT";

  return (
    <div className="w-full max-w-115 min-h-screen flex flex-col justify-center items-center gap-4 p-4 mx-auto">
      <HelpCircleIcon className="w-24 h-24 text-error text-center" />
      <div className="text-center flex flex-col gap-2">
        <h1 className="font-semibold text-2xl sm:text-3xl">Page Not Found</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          We can&apos;t seem to find the page you&apos;re looking for. Please check the URL or{" "}
          {isLoggedIn ? "back to dashboard" : "back to sign in"}.
        </p>
      </div>
      <Link
        href={isLoggedIn ? (isAgent ? "/agent" : "/client") : "/signin"}
        className={buttonVariants({ variant: "outline", size: "lg", className: "font-semibold" })}
      >
        Back to {isLoggedIn ? "dashboard" : "sign in"}
      </Link>
    </div>
  );
}
