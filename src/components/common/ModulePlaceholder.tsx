import { Construction } from "lucide-react";
import { PageHeader } from "./PageHeader";

interface Props {
  title: string;
  description?: string;
  eyebrow?: string;
}

export function ModulePlaceholder({ title, description, eyebrow }: Props) {
  return (
    <>
      <PageHeader title={title} subtitle={description} eyebrow={eyebrow ?? "Module"} />
      <div className="surface-card flex min-h-[420px] flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Construction className="h-7 w-7" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Module ready for build
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            This workspace is wired into the RiayahOS foundation. The design system,
            navigation, and component library are ready — feature modules will plug in
            here next.
          </p>
        </div>
      </div>
    </>
  );
}
