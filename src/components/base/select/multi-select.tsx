"use client";

import type { FC, ReactNode, RefAttributes } from "react";
import { createContext, isValidElement, useState, useRef } from "react";
import { ChevronDown } from "@untitledui/icons";
import { Check } from "@untitledui/icons";
import type { Selection, Key } from "react-aria-components";
import {
  Button as AriaButton,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Text as AriaText,
  Dialog as AriaDialog
} from "react-aria-components";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { cx } from "@/utils/cx";
import { Popover } from "./popover";

// ── Types ────────────────────────────────────────────────────────────────────
export type MultiSelectItemType = {
  id: string;
  label?: string;
  isDisabled?: boolean;
};

interface MultiSelectProps extends RefAttributes<HTMLDivElement> {
  items?: MultiSelectItemType[];
  label?: string;
  hint?: string;
  tooltip?: string;
  size?: "sm" | "md";
  placeholder?: string;
  popoverClassName?: string;
  placeholderIcon?: FC | ReactNode;
  children: ReactNode | ((item: MultiSelectItemType) => ReactNode);
  selectedKeys?: "all" | Iterable<Key>;
  onSelectionChange?: (keys: Selection) => void;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  id?: string;
  className?: string;
}

// ── Sizes ────────────────────────────────────────────────────────────────────
const sizes = {
  sm: { root: "py-2 px-3" },
  md: { root: "py-2.5 px-3.5" },
};

const itemSizes = {
  sm: "p-2 pr-2.5",
  md: "p-2.5 pl-2",
};

export const MultiSelectContext = createContext<{ size: "sm" | "md" }>({ size: "sm" });

// ── SelectItem (inlined to avoid circular dependency) ────────────────────────
function MultiSelectItem({ id, label, isDisabled, size = "sm" }: MultiSelectItemType & { size?: "sm" | "md" }) {
  return (
    <AriaListBoxItem
      id={id}
      textValue={label || id}
      isDisabled={isDisabled}
      className={(state) => cx("w-full px-1.5 py-px outline-hidden")}
    >
      {(state) => (
        <div
          className={cx(
            "flex cursor-pointer items-center gap-2 rounded-md outline-hidden select-none",
            state.isSelected && "bg-active",
            state.isDisabled && "cursor-not-allowed",
            state.isFocused && "bg-primary_hover",
            state.isFocusVisible && "ring-2 ring-focus-ring ring-inset",
            itemSizes[size],
          )}
        >
          <div className="flex w-full min-w-0 flex-1 flex-wrap gap-x-2">
            <AriaText
              slot="label"
              className={cx("truncate text-md font-medium whitespace-nowrap text-primary", state.isDisabled && "text-disabled")}
            >
              {label}
            </AriaText>
          </div>

          {state.isSelected && (
            <Check
              aria-hidden="true"
              className={cx(
                "ml-auto text-fg-brand-primary",
                size === "sm" ? "size-4 stroke-[2.5px]" : "size-5",
                state.isDisabled && "text-fg-disabled",
              )}
            />
          )}
        </div>
      )}
    </AriaListBoxItem>
  );
}

// ── MultiSelect Component ────────────────────────────────────────────────────
const MultiSelect = ({
  placeholder = "Select items",
  placeholderIcon,
  size = "sm",
  children,
  items,
  label,
  hint,
  tooltip,
  selectedKeys,
  onSelectionChange,
  isInvalid,
  isRequired,
  isDisabled,
  className,
  ...rest
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const Icon = placeholderIcon;
  const selectedCount = selectedKeys === "all"
    ? (items?.length || 0)
    : selectedKeys
      ? Array.from(selectedKeys as Iterable<Key>).length
      : 0;

  let summaryText = placeholder;
  if (selectedCount > 0 && items) {
    summaryText = `${selectedCount} tanlandi`;
  }

  return (
    <MultiSelectContext.Provider value={{ size }}>
      <div className={cx("flex flex-col gap-1.5", className)}>
        {label && (
          <Label isRequired={isRequired} tooltip={tooltip}>
            {label}
          </Label>
        )}

        <AriaButton
          ref={triggerRef}
          onPress={() => !isDisabled && setIsOpen(!isOpen)}
          isDisabled={isDisabled}
          className={cx(
            "relative flex w-full cursor-pointer items-center rounded-lg bg-primary shadow-xs ring-1 ring-primary outline-hidden transition duration-100 ease-linear ring-inset",
            isOpen && "ring-2 ring-brand",
            isDisabled && "cursor-not-allowed bg-disabled_subtle opacity-70",
            sizes[size].root,
          )}
        >
          <div className="flex h-max w-full items-center justify-start gap-2 truncate text-left align-middle">
            {isValidElement(Icon) ? Icon : null}

            <p className={cx("text-md truncate", selectedCount > 0 ? "font-medium text-primary" : "text-placeholder")}>
              {summaryText}
            </p>

            <ChevronDown
              aria-hidden="true"
              className={cx("ml-auto shrink-0 text-fg-quaternary", size === "sm" ? "size-4 stroke-[2.5px]" : "size-5")}
            />
          </div>
        </AriaButton>

        {isOpen && (
          <Popover isOpen={isOpen} onOpenChange={setIsOpen} size={size} triggerRef={triggerRef} className={rest.popoverClassName}>
            <AriaDialog aria-label={label || "Multi select dialog"} className="outline-hidden">
              <AriaListBox
                items={items}
                className="size-full outline-hidden max-h-[300px] overflow-y-auto"
                selectionMode="multiple"
                selectedKeys={selectedKeys as Iterable<Key>}
                onSelectionChange={onSelectionChange}
              >
                {children}
              </AriaListBox>
            </AriaDialog>
          </Popover>
        )}

        {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
      </div>
    </MultiSelectContext.Provider>
  );
};

// ── Export with .Item ────────────────────────────────────────────────────────
const _MultiSelect = MultiSelect as typeof MultiSelect & {
  Item: typeof MultiSelectItem;
};
_MultiSelect.Item = MultiSelectItem;

export { _MultiSelect as MultiSelect };
