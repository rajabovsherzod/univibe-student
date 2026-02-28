"use client";

import {
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  createContext,
  useContext,
  useState,
} from "react";
import { HelpCircle, InfoCircle, Eye, EyeOff } from "@untitledui/icons";
import type {
  InputProps as AriaInputProps,
  TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import {
  Group as AriaGroup,
  Input as AriaInput,
  TextField as AriaTextField,
} from "react-aria-components";

import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { cx, sortCx } from "@/utils/cx";

interface BaseProps {
  label?: string;
  hint?: ReactNode;
}

interface TextFieldProps
  extends BaseProps,
  AriaTextFieldProps,
  Pick<
    InputBaseProps,
    "size" | "wrapperClassName" | "inputClassName" | "iconClassName" | "tooltipClassName"
  > {
  ref?: Ref<HTMLDivElement>;
}

const TextFieldContext = createContext<TextFieldProps>({});

export interface InputBaseProps extends TextFieldProps {
  tooltip?: string;
  size?: "sm" | "md";
  placeholder?: string;
  iconClassName?: string;
  inputClassName?: string;
  wrapperClassName?: string;
  tooltipClassName?: string;
  shortcut?: string | boolean;
  ref?: Ref<HTMLInputElement>;
  groupRef?: Ref<HTMLDivElement>;
  icon?: ComponentType<HTMLAttributes<HTMLOrSVGElement>>;
}

export const InputBase = ({
  ref,
  tooltip,
  shortcut,
  groupRef,
  size = "sm",
  isInvalid,
  isDisabled,
  icon: Icon,
  placeholder,
  wrapperClassName,
  tooltipClassName,
  inputClassName,
  iconClassName,
  // Omit this prop to avoid invalid HTML attribute warning
  isRequired: _isRequired,
  ...inputProps
}: Omit<InputBaseProps, "label" | "hint">) => {
  const hasTrailingIcon = Boolean(tooltip || isInvalid);
  const hasLeadingIcon = Boolean(Icon);

  const context = useContext(TextFieldContext);
  const inputSize = context?.size || size;

  // Track password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const resolvedType = context?.type || inputProps.type;
  const isPassword = resolvedType === "password";
  const effectiveType = isPassword ? (showPassword ? "text" : "password") : resolvedType;

  // Determine spacing rules based on icon presence
  const hasTrailingAction = Boolean(tooltip || isInvalid || isPassword);

  const sizes = sortCx({
    sm: {
      root: cx("px-3 py-2", hasTrailingAction && "pr-9", hasLeadingIcon && "pl-10"),
      iconLeading: "left-3",
      iconTrailing: "right-3",
      shortcut: "pr-2.5",
    },
    md: {
      root: cx("px-3.5 py-2.5", hasTrailingAction && "pr-9.5", hasLeadingIcon && "pl-10.5"),
      iconLeading: "left-3.5",
      iconTrailing: "right-3.5",
      shortcut: "pr-3",
    },
  });

  return (
    <AriaGroup
      {...{ isDisabled, isInvalid }}
      ref={groupRef}
      className={({ isFocusWithin, isDisabled, isInvalid }) =>
        cx(
          // ✅ base
          "relative flex w-full flex-row place-content-center place-items-center border rounded-lg bg-bg-secondary shadow-xs",
          "border-border-primary transition-[border-color] duration-100 ease-linear",

          /**
           * ✅ OQ HALO'NI BUTUNLAY O‘CHIRISH:
           * ring-offset default oq bo‘ladi. Shuning uchun har doim 0 qilamiz.
           */
          "!ring-offset-0 !ring-offset-transparent",

          /**
           * ✅ outline ham butunlay yo‘q:
           * (ba’zi browserlar/ global css fokusda oq outline chizadi)
           */
          "!outline-none focus-within:!outline-none",

          // ✅ focus = thin brand ring without thick glow
          isFocusWithin && !isDisabled && !isInvalid && "!border-brand-500",

          // disabled
          isDisabled && "cursor-not-allowed bg-disabled_subtle border-disabled",
          "group-disabled:cursor-not-allowed group-disabled:bg-disabled_subtle group-disabled:border-disabled",

          // invalid
          isInvalid && "!border-error-500",
          "group-invalid:!border-error-500",

          // invalid + focus
          isInvalid && isFocusWithin && "!border-error-500",
          isFocusWithin && "group-invalid:!border-error-500",

          context?.wrapperClassName,
          wrapperClassName,
        )
      }
    >
      {Icon && (
        <Icon
          className={cx(
            "pointer-events-none absolute size-5 text-fg-quaternary",
            isDisabled && "text-fg-disabled",
            sizes[inputSize].iconLeading,
            context?.iconClassName,
            iconClassName,
          )}
        />
      )}

      <AriaInput
        {...(inputProps as AriaInputProps)}
        ref={ref}
        type={effectiveType}
        placeholder={placeholder}
        className={cx(
          "m-0 w-full bg-transparent text-md text-primary ring-0 placeholder:text-placeholder",
          "autofill:rounded-lg autofill:text-primary",

          // ✅ input outline/ring ham 0 — oq fokus chiqmaydi
          "!outline-none focus:!outline-none focus-visible:!outline-none",
          "focus-visible:!ring-0 focus-visible:!shadow-none focus-visible:!border-transparent",

          isDisabled && "cursor-not-allowed text-disabled",
          sizes[inputSize].root,
          context?.inputClassName,
          inputClassName,
        )}
      />

      {isPassword ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
          onClick={(e) => {
            e.preventDefault();
            setShowPassword((prev) => !prev);
          }}
          className={cx(
            "absolute flex place-content-center place-items-center text-fg-quaternary transition hover:text-fg-quaternary_hover pointer-events-auto z-10 cursor-pointer",
            sizes[inputSize].iconTrailing,
          )}
        >
          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      ) : isInvalid ? (
        <InfoCircle
          className={cx(
            "pointer-events-none absolute size-5 text-fg-error-secondary",
            sizes[inputSize].iconTrailing,
            context?.tooltipClassName,
            tooltipClassName,
          )}
        />
      ) : tooltip ? (
        <Tooltip title={tooltip} placement="top">
          <TooltipTrigger
            className={cx(
              "absolute cursor-pointer text-fg-quaternary transition duration-200 hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover",
              sizes[inputSize].iconTrailing,
              context?.tooltipClassName,
              tooltipClassName,
            )}
          >
            <HelpCircle className="size-5" />
          </TooltipTrigger>
        </Tooltip>
      ) : null}

      {shortcut && (
        <div
          className={cx(
            "pointer-events-none absolute inset-y-0.5 right-0.5 z-10 flex items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-bg-primary to-40% pl-8",
            sizes[inputSize].shortcut,
          )}
        >
          <span
            className={cx(
              "pointer-events-none rounded px-1 py-px text-xs font-medium text-quaternary ring-1 ring-secondary select-none ring-inset",
              isDisabled && "bg-transparent text-disabled",
            )}
            aria-hidden="true"
          >
            {typeof shortcut === "string" ? shortcut : "⌘K"}
          </span>
        </div>
      )}
    </AriaGroup>
  );
};

InputBase.displayName = "InputBase";

export const TextField = ({ className, ...props }: TextFieldProps) => {
  return (
    <TextFieldContext.Provider value={props}>
      <AriaTextField
        {...props}
        data-input-wrapper
        className={(state) =>
          cx(
            "group flex h-max w-full flex-col items-start justify-start gap-1.5",
            typeof className === "function" ? className(state) : className,
          )
        }
      />
    </TextFieldContext.Provider>
  );
};

TextField.displayName = "TextField";

interface InputProps extends InputBaseProps, BaseProps {
  hideRequiredIndicator?: boolean;
}

export const Input = ({
  size = "sm",
  placeholder,
  icon: Icon,
  label,
  hint,
  shortcut,
  hideRequiredIndicator,
  className,
  ref,
  groupRef,
  tooltip,
  iconClassName,
  inputClassName,
  wrapperClassName,
  tooltipClassName,
  ...props
}: InputProps) => {
  return (
    <TextField aria-label={!label ? placeholder : undefined} {...props} className={className}>
      {({ isRequired, isInvalid }) => (
        <>
          {label && (
            <Label isRequired={hideRequiredIndicator ? !hideRequiredIndicator : isRequired}>
              {label}
            </Label>
          )}

          <InputBase
            {...{
              ref,
              groupRef,
              size,
              placeholder,
              icon: Icon,
              shortcut,
              iconClassName,
              inputClassName,
              wrapperClassName,
              tooltipClassName,
              tooltip,
              type: props.type,
            }}
          />

          {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
        </>
      )}
    </TextField>
  );
};

Input.displayName = "Input";
