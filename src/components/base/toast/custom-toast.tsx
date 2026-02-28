import { toast } from "sonner";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cx } from "@/utils/cx"; // Yoki "clsx", "tailwind-merge" ishlatsangiz ham bo'ladi

export interface CustomToastProps {
  t: string | number; // Toast ID
  title: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const CustomToast = ({
  t,
  title,
  description,
  type = "info",
  action,
}: CustomToastProps) => {
  // Untitled UI dizayniga xos ranglar palitrasi
  const styles = {
    success: {
      icon: <CheckCircle className="size-5 text-green-600" aria-hidden="true" />,
      wrapper: "bg-green-100 ring-[6px] ring-green-50",
      actionText: "text-green-700 hover:text-green-800",
    },
    error: {
      icon: <AlertCircle className="size-5 text-red-600" aria-hidden="true" />,
      wrapper: "bg-red-100 ring-[6px] ring-red-50",
      actionText: "text-red-700 hover:text-red-800",
    },
    warning: {
      icon: <AlertTriangle className="size-5 text-amber-600" aria-hidden="true" />,
      wrapper: "bg-amber-100 ring-[6px] ring-amber-50",
      actionText: "text-amber-700 hover:text-amber-800",
    },
    info: {
      icon: <Info className="size-5 text-blue-600" aria-hidden="true" />,
      wrapper: "bg-blue-100 ring-[6px] ring-blue-50",
      actionText: "text-blue-700 hover:text-blue-800",
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={cx(
        "pointer-events-auto flex w-full max-w-[400px] items-start gap-4 rounded-xl bg-white p-4",
        "border border-gray-200 shadow-lg shadow-gray-900/5", // Subtle professional shadow and border
      )}
    >
      {/* Featured Icon */}
      <div className="flex shrink-0 items-center justify-center pt-1">
        <div
          className={cx(
            "flex size-8 items-center justify-center rounded-full",
            currentStyle.wrapper
          )}
        >
          {currentStyle.icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 pt-1.5">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 leading-relaxed">
            {description}
          </p>
        )}

        {/* Action Buttons */}
        {action && (
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => {
                action.onClick();
                toast.dismiss(t);
              }}
              className={cx(
                "text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 rounded-sm",
                currentStyle.actionText
              )}
            >
              {action.label}
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 rounded-sm"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Close Button (Top Right) */}
      <div className="flex shrink-0 items-center justify-center">
        <button
          onClick={() => toast.dismiss(t)}
          className="inline-flex rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};