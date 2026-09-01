"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusAlert } from "@/components/shared/status-alert";
import { TicketEntity } from "@/features/tickets/types";
import { handleCreateTicketByClient } from "@/features/tickets/actions";

const priorityItems: {
  label: Capitalize<Lowercase<TicketEntity["priority"]>>;
  value: TicketEntity["priority"];
}[] = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
] as const;

export function CreateTicketFormDialog({
  userId,
  isCreateTicketDialogActive,
  setIsCreateTicketDialogActive,
  button,
}: {
  userId: string;
  isCreateTicketDialogActive: boolean;
  setIsCreateTicketDialogActive: (newDialogStatus: boolean) => void;
  button: React.ReactElement;
}) {
  const [state, formAction, isPending] = React.useActionState(
    handleCreateTicketByClient,
    undefined,
  );

  React.useEffect(() => {
    if (state && state.success) setIsCreateTicketDialogActive(false);
  }, [state, setIsCreateTicketDialogActive]);

  const formId = `create-ticket-form-by-${userId}`;

  return (
    <Dialog open={isCreateTicketDialogActive} onOpenChange={setIsCreateTicketDialogActive}>
      <DialogTrigger render={button} />
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {state && !state.success && (
          <StatusAlert
            variant="error"
            title="Create ticket failed"
            description={state.message ?? "An error occurred while creating a new ticket."}
          />
        )}
        <DialogHeader>
          <DialogTitle>Create new ticket</DialogTitle>
          <DialogDescription>Fill out the details below to report an issue.</DialogDescription>
        </DialogHeader>
        <form action={formAction} id={formId}>
          <FieldGroup>
            <Field>
              <Label htmlFor="title">Title</Label>
              <Input
                key={state?.values?.title ?? "title-input"}
                id="title"
                type="text"
                name="title"
                placeholder="Enter a brief summary of the issue..."
                defaultValue={state?.values?.title ?? ""}
              />
              {state?.errors?.title &&
                state?.errors?.title.map((val) => (
                  <FieldError key={val} className="text-error">
                    {val}
                  </FieldError>
                ))}
            </Field>
            <Field>
              <Label htmlFor="description">Description</Label>
              <Textarea
                key={state?.values?.description ?? "description-textarea"}
                id="description"
                name="description"
                placeholder="Describe the issue and steps to reproduce in detail..."
                defaultValue={state?.values?.description ?? ""}
                className="min-h-25"
              />
              {state?.errors?.description &&
                state?.errors?.description.map((val) => (
                  <FieldError key={val} className="text-error">
                    {val}
                  </FieldError>
                ))}
            </Field>
            <Field>
              <Label htmlFor="priority">Priority</Label>
              <Select
                key={state?.values?.priority ?? "priority-select"}
                id="priority"
                name="priority"
                items={priorityItems}
                defaultValue={state?.values?.priority ?? priorityItems[0].value}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {priorityItems.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {state?.errors?.priority &&
                state?.errors?.priority.map((val) => (
                  <FieldError key={val} className="text-error">
                    {val}
                  </FieldError>
                ))}
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? "Processing..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
