import { Loader2Icon } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center gap-2">
      <Loader2Icon className="w-12 h-12 animate-spin text-primary" />
      <p className="text-xl text-muted-foreground font-medium">Loading...</p>
    </div>
  );
}
