"use client";

import * as React from "react";
import { UserSettingsForm } from "@/features/users/components/user-settings-form";
import { UserEntity } from "@/features/users/types";
import { Prettify } from "@/lib/types";

export function ClientUserSettings({
  user,
}: {
  user: Prettify<Pick<UserEntity, "id" | "name" | "email">>;
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
