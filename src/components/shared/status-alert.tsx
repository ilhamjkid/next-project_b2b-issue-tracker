import * as React from "react";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function StatusAlert({
  variant,
  title,
  description,
  className,
}: {
  variant?: "default" | "destructive" | "success" | "warning" | "info" | "error" | null;
  title: string;
  description: string;
} & React.ComponentProps<"div">) {
  return (
    <Alert variant={variant} className={cn("max-w-md", className)}>
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
