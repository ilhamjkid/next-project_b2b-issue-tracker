import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function StatusAlert({
  variant,
  title,
  description,
}: {
  variant?: "default" | "destructive" | "success" | "warning" | "info" | "error" | null;
  title: string;
  description: string;
}) {
  return (
    <Alert variant={variant} className="max-w-md">
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
