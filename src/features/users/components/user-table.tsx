"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { UserDeleteDialog } from "@/features/users/components/user-delete-dialog";

type ActiveDialog =
  | { type?: undefined; id?: undefined }
  | { type: "CREATE"; id?: undefined }
  | { type: "UPDATE" | "DELETE"; id: string };

export function UserTable({
  users,
}: {
  users: {
    id: string;
    name: string;
    email: string;
    role: "CLIENT" | "AGENT";
    created_at: string;
  }[];
}) {
  const [activeDialog, setActiveDialog] = React.useState<ActiveDialog>({
    type: undefined,
    id: undefined,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(user.created_at))}
            </TableCell>
            <TableCell className="flex gap-1">
              {activeDialog.type === "UPDATE" && activeDialog.id === user.id ? (
                <UserFormDialog
                  activeDialog={activeDialog}
                  setActiveDialog={setActiveDialog}
                  mode="UPDATE"
                  userId={user.id}
                  defaultValues={user}
                  button={
                    <Button size="sm" variant="secondary" className="font-semibold rounded-sm">
                      Update
                    </Button>
                  }
                />
              ) : (
                <Button
                  onClick={() => setActiveDialog({ type: "UPDATE", id: user.id })}
                  size="sm"
                  variant="secondary"
                  className="font-semibold rounded-sm"
                >
                  Update
                </Button>
              )}
              {activeDialog.type === "DELETE" && activeDialog.id === user.id ? (
                <UserDeleteDialog
                  activeDialog={activeDialog}
                  setActiveDialog={setActiveDialog}
                  userId={user.id}
                  userEmail={user.email}
                  button={
                    <Button size="sm" variant="destructive" className="font-semibold rounded-sm">
                      Delete
                    </Button>
                  }
                />
              ) : (
                <Button
                  onClick={() => setActiveDialog({ type: "DELETE", id: user.id })}
                  size="sm"
                  variant="destructive"
                  className="font-semibold rounded-sm"
                >
                  Delete
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
