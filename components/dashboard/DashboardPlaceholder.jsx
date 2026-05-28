import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPlaceholder({
  badge = "Workspace",
  title,
  description,
  ctaLabel = "Create a Course",
  ctaHref = "/dashboard/create-course",
}) {
  return (
    <Card className="glass-panel-strong rounded-[2rem]">
      <CardHeader className="space-y-4 border-b border-white/8 pb-6">
        <Badge variant="secondary" className="w-fit">
          <Sparkles className="h-3.5 w-3.5" />
          {badge}
        </Badge>

        <div className="space-y-2">
          <CardTitle className="text-3xl sm:text-4xl">{title}</CardTitle>
          <p className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
            {description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-3 text-sm text-white/56 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] px-4 py-4">
            Better hierarchy
          </div>
          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] px-4 py-4">
            More cohesive theme
          </div>
          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] px-4 py-4">
            Ready for the next feature pass
          </div>
        </div>

        <Button asChild size="lg" className="rounded-full">
          <Link href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
