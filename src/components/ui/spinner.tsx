import { LoaderIcon } from "lucide-react";
import { cx } from "@/utils/cx";

export function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cx("size-4 animate-spin text-current", className)}
      {...props}
    />
  );
}

export function SpinnerCustom() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
    </div>
  );
}
