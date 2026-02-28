"use client";

import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { cx } from "@/utils/cx";

interface CustomOTPProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isInvalid?: boolean;
}

export function CustomOTP({ length = 6, value, onChange, disabled, isInvalid }: CustomOTPProps) {
  const [activeOTPIndex, setActiveOTPIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement[]>([]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    const lastChar = val.substring(val.length - 1);

    if (!/^\d*$/.test(lastChar)) {
      return; // allow only numbers
    }

    const newOTP = value.padEnd(length, " ").split("");
    newOTP[index] = lastChar;
    const newValue = newOTP.join("").replace(/ /g, "").substring(0, length);
    onChange(newValue);

    if (lastChar && index < length - 1) {
      inputRef.current[index + 1]?.focus();
    }
  };

  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOTP = value.padEnd(length, " ").split("");
      newOTP[index] = "";
      onChange(newOTP.join("").replace(/ /g, ""));
      if (index > 0) {
        inputRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRef.current[index + 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRef.current[index - 1]?.focus();
    }
  };

  const handleOnPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      inputRef.current[Math.min(pastedData.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex w-full items-center justify-between gap-1 sm:gap-2">
      {Array.from({ length }).map((_, index) => {
        const char = value[index] || "";
        return (
          <React.Fragment key={index}>
            <input
              ref={(el) => {
                if (el) inputRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={2}
              className={cx(
                "w-12 h-14 sm:w-16 sm:h-20 rounded-xl text-center text-xl sm:text-2xl font-bold transition-all outline-none shrink-0",
                char
                  ? "bg-white border-2 border-brand-500 text-primary shadow-sm dark:bg-bg-secondary dark:border-brand-500"
                  : "bg-white border border-border-secondary text-primary dark:bg-bg-secondary dark:border-border-primary",
                "focus:bg-white focus:border-2 focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(21,94,239,0.1)] dark:focus:bg-bg-secondary",
                isInvalid && "border-error-500 bg-error-50 text-error-700 focus:border-error-500",
                disabled && "opacity-50 cursor-not-allowed bg-bg-disabled"
              )}
              value={char}
              onChange={(e) => handleOnChange(e, index)}
              onKeyDown={(e) => handleOnKeyDown(e, index)}
              onPaste={handleOnPaste}
              onFocus={(e) => {
                setActiveOTPIndex(index);
                e.target.select();
              }}
              disabled={disabled}
            />
            {index === 2 && <span className="text-border-secondary font-medium shrink-0">-</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
