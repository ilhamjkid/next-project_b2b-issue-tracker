"use client";

import * as React from "react";
import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  CircleUserRoundIcon,
  LayoutDashboardIcon,
  UsersIcon,
  SettingsIcon,
  LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ToggleTheme } from "@/components/shared/toggle-theme";
import { UserEntity } from "@/features/users/types";
import { handleSignout } from "@/features/auth/actions";
import { Prettify } from "@/lib/types";

const navMain: Record<
  UserEntity["role"],
  {
    title: string;
    Icon: LucideIcon;
    url: string;
    subUrl?: string;
  }[]
> = {
  AGENT: [
    { title: "Dashboard", Icon: LayoutDashboardIcon, url: "/agent", subUrl: "/tickets" },
    { title: "Users", Icon: UsersIcon, url: "/agent/users", subUrl: undefined },
  ],
  CLIENT: [
    { title: "Dashboard", Icon: LayoutDashboardIcon, url: "/client", subUrl: "/tickets" },
    { title: "Settings", Icon: SettingsIcon, url: "/client/settings", subUrl: undefined },
  ],
} as const;

export function AppSidebar({
  user,
  ...props
}: { user: Prettify<Pick<UserEntity, "name" | "email" | "role">> } & React.ComponentProps<
  typeof Sidebar
>) {
  const pathname = usePathname();
  const [, formAction, isPending] = React.useActionState(handleSignout, undefined);

  function isActiveLink(pathname: string, url: string, subUrl?: string) {
    if (!subUrl) return pathname === url;
    return pathname === url || pathname.startsWith(url + subUrl);
  }

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href={user.role === "AGENT" ? "/agent" : "/client"} />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <CircleUserRoundIcon size="4" />
              </div>
              <div className="flex flex-col gap-1 leading-none">
                <span className="font-medium">{user.name}</span>
                <span>{user.email}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {navMain[user.role].map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<Link href={item.url} />}
                  size="lg"
                  className={clsx("font-medium text-base hover:text-info active:text-info", {
                    "text-info": isActiveLink(pathname, item.url, item.subUrl),
                  })}
                >
                  <item.Icon /> {item.title}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ToggleTheme />
        <form action={formAction}>
          <Button
            type="submit"
            size="lg"
            variant="destructive"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "PROCESSING..." : "SIGN OUT"}
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
