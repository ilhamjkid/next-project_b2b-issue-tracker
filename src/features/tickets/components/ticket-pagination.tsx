"use client";

import * as React from "react";
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const limitItems = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "25", value: "25" },
  { label: "50", value: "50" },
  { label: "100", value: "100" },
] as const;

export function TicketPagination({ totalTickets }: { totalTickets: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const limit = Number(searchParams.get("limit")?.toString() ?? "5");
  const currentPage = Number(searchParams.get("page")?.toString() ?? "1");
  const totalPage = Math.ceil(totalTickets / limit);
  const [isPending, startTransition] = React.useTransition();

  const updateParamLimitValue = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (["5", "10", "25", "50", "100"].includes(value)) {
      if (value === "5") params.delete("limit");
      else params.set("limit", value);
    } else params.delete("limit");
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
        <Select
          items={limitItems}
          onValueChange={(value) => {
            updateParamLimitValue(value ?? "");
          }}
          value={String(limit)}
          disabled={isPending}
        >
          <SelectTrigger className="w-20" id="select-rows-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              {limitItems.map((limit) => (
                <SelectItem key={limit.value} value={limit.value}>
                  {limit.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      {totalPage > 1 && (
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={getPaginationLinkHref({
                  searchParams,
                  currentPage,
                  totalPage,
                  direction: "PREV",
                })}
                className={cn(buttonVariants({ variant: "outline" }), {
                  "pointer-events-none opacity-50": currentPage <= 1,
                })}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href={getPaginationLinkHref({
                  searchParams,
                  currentPage,
                  totalPage,
                  direction: "NEXT",
                })}
                className={cn(buttonVariants({ variant: "outline" }), {
                  "pointer-events-none opacity-50": currentPage >= totalPage,
                })}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function getPaginationLinkHref({
  searchParams,
  currentPage,
  totalPage,
  direction,
}: {
  searchParams: ReadonlyURLSearchParams;
  currentPage: number;
  totalPage: number;
  direction: "PREV" | "NEXT";
}) {
  const params = new URLSearchParams(searchParams);
  if (direction === "PREV") {
    if (currentPage <= 2) params.delete("page");
    else params.set("page", String(currentPage - 1));
  } else {
    if (currentPage > totalPage) params.delete("page");
    else if (currentPage === totalPage) {
      if (currentPage === 1) params.delete("page");
      else params.set("page", String(currentPage));
    } else params.set("page", String(currentPage + 1));
  }
  return `?${params.toString()}`;
}
