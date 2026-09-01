import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  stat,
  className,
  ...props
}: {
  stat: { label: string; count: number; Icon: LucideIcon };
} & React.ComponentProps<"div">) {
  const { Icon } = stat;

  return (
    <Card className={cn("justify-between gap-12", className)} {...props}>
      <CardHeader className="flex flex-wrap justify-between items-center gap-2">
        <CardTitle className="text-muted-foreground text-xl">{stat.label}</CardTitle>
        <div className="bg-secondary p-2 rounded-lg">
          <Icon size={24} />
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="text-6xl text-center font-medium">{stat.count}</h4>
      </CardContent>
    </Card>
  );
}
