"use client";

import * as React from "react";
import { UserSettingsForm } from "@/features/users/components/user-settings-form";

export function ClientUserSettings({
  user,
}: {
  user: { id: string; name: string; email: string; role: "CLIENT" | "AGENT" };
}) {
  const [formKey, setFormKey] = React.useState<0 | 1>(0);

  const handleResetFormState = () => {
    setFormKey((prev) => (prev === 0 ? 1 : 0));
  };

  return (
    <div className="max-w-md mx-auto">
      <UserSettingsForm key={formKey} user={user} onResetFormState={handleResetFormState} />
    </div>
  );
}
