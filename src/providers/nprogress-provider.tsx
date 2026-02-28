"use client";

import React, { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

type NProgressOptions = {
  showSpinner?: boolean;
  trickleSpeed?: number;
  minimum?: number;
  easing?: string;
  speed?: number;
  color?: string;
};

function NProgressInner({
  options,
}: {
  options?: NProgressOptions;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({
      showSpinner: options?.showSpinner ?? false,
      trickleSpeed: options?.trickleSpeed ?? 200,
      minimum: options?.minimum ?? 0.08,
      easing: options?.easing ?? "ease",
      speed: options?.speed ?? 200,
      template: `<div class="bar" style="background: ${options?.color ?? "#007aff"}; z-index: 1031;" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>`,
    });
  }, [options]);

  useEffect(() => {
    NProgress.done();
    return () => {
      NProgress.start();
    };
  }, [pathname, searchParams]);

  return (
    <style jsx global>{`
      /* Make clicks pass-through */
      #nprogress {
        pointer-events: none;
      }

      #nprogress .bar {
        background: ${options?.color ?? "#007aff"};
        position: fixed;
        z-index: 1031;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
      }

      /* Fancy blur effect */
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px ${options?.color ?? "#007aff"}, 0 0 5px ${options?.color ?? "#007aff"
      };
        opacity: 1;
        transform: rotate(3deg) translate(0px, -4px);
      }
    `}</style>
  );
}

export function NProgressProvider({
  options,
}: {
  options?: NProgressOptions;
}) {
  return (
    <Suspense fallback={null}>
      <NProgressInner options={options} />
    </Suspense>
  );
}
