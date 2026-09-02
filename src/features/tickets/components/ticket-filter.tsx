"use client";

import * as React from "react";
import { useDebouncedCallback } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketEntity } from "@/features/tickets/types";
import { UnderscoreToSpace } from "@/lib/types";

const statusItems: {
  label: UnderscoreToSpace<Lowercase<TicketEntity["status"]>, "WITH_CAPITALIZE"> | "All";
  value: TicketEntity["status"] | "";
}[] = [
  { label: "All", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
] as const;

const priorityItems: {
  label: Capitalize<Lowercase<TicketEntity["priority"]>> | "All";
  value: TicketEntity["priority"] | "";
}[] = [
  { label: "All", value: "" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
] as const;

export function TicketFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramSearchValue = searchParams.get("search")?.toString() ?? "";
  const paramStatusValue = searchParams.get("status")?.toString() ?? "";
  const paramPriorityValue = searchParams.get("priority")?.toString() ?? "";
  const [localSearchValue, setLocalSearchValue] = React.useState(paramSearchValue);
  const [isPending, startTransition] = React.useTransition();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const updateParamSearchValue = useDebouncedCallback(
    (keyword: string) => updateParam("search", keyword),
    1000,
  );

  const isUserTyping = paramSearchValue !== localSearchValue;

  return (
    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
      <InputGroup>
        <InputGroupInput
          placeholder="Search..."
          onChange={(e) => {
            setLocalSearchValue(e.target.value);
            updateParamSearchValue(e.target.value);
          }}
          value={localSearchValue}
          disabled={isPending}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <Select
        items={statusItems}
        onValueChange={(value) => {
          updateParam("status", value ?? "");
        }}
        value={paramStatusValue}
        disabled={isPending || isUserTyping}
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {statusItems.map((status) => (
              <SelectItem key={status.value || status.label} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        items={priorityItems}
        onValueChange={(value) => {
          updateParam("priority", value ?? "");
        }}
        value={paramPriorityValue}
        disabled={isPending || isUserTyping}
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {priorityItems.map((priority) => (
              <SelectItem key={priority.value || priority.label} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
