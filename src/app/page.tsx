import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();

  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-6">
      <h1 className="text-4xl font-semibold">Landing Page</h1>
      <div className="w-48 flex flex-col gap-4">
        {session?.user ? (
          <Button className="rounded-sm text-xl font-semibold py-6 px-4">
            <Link href={session.user.role === "CLIENT" ? "/client" : "/agent"}>DASHBOARD</Link>
          </Button>
        ) : (
          <>
            <Button className="rounded-sm text-xl font-semibold py-6 px-4">
              <Link href="/signin">SIGN IN</Link>
            </Button>
            <Button className="rounded-sm text-xl font-semibold py-6 px-4">
              <Link href="/signup">SIGN UP</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
