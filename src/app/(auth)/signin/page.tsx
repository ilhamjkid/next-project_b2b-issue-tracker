import { Metadata } from "next";
import { SigninForm } from "@/features/auth/components/signin-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SigninPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SigninForm />
      </div>
    </div>
  );
}
