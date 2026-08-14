import { Button } from "@/components/ui/button";
import { signout } from "@/features/auth/actions";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-6">
      {children}
      <form action={signout} className="w-48 flex flex-col">
        <Button type="submit" className="rounded-sm text-xl font-semibold py-6 px-4">
          SIGN OUT
        </Button>
      </form>
    </main>
  );
}
