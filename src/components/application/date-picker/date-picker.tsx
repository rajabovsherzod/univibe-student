"use client";

import { getLocalTimeZone, today } from "@internationalized/date";
import { useControlledState } from "@react-stately/utils";
import { Calendar as CalendarIcon } from "@untitledui/icons";
import type { DatePickerProps as AriaDatePickerProps, DateValue } from "react-aria-components";
import {
  DatePicker as AriaDatePicker,
  Dialog as AriaDialog,
  Group as AriaGroup,
  I18nProvider,
  Popover as AriaPopover,
} from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { useTranslation } from "@/lib/i18n/i18n";
import { Calendar } from "./calendar";

const highlightedDates = [today(getLocalTimeZone())];

// Map the app locale → a BCP-47 tag so month/weekday names + the trigger label
// render in the selected language.
const LOCALE_TAG: Record<string, string> = { uz: "uz", ru: "ru-RU", en: "en-US" };

interface DatePickerProps extends AriaDatePickerProps<DateValue> {
  /** The function to call when the apply button is clicked. */
  onApply?: () => void;
  /** The function to call when the cancel button is clicked. */
  onCancel?: () => void;
  /** Custom placeholder text when no date is selected. */
  placeholder?: string;
}

export const DatePicker = ({ value: valueProp, defaultValue, onChange, onApply, onCancel, placeholder, ...props }: DatePickerProps) => {
  const { t, locale } = useTranslation();
  const localeTag = LOCALE_TAG[locale] || "en-US";
  const [value, setValue] = useControlledState(valueProp, defaultValue || null, onChange);

  const formattedDate = value
    ? new Intl.DateTimeFormat(localeTag, { day: "2-digit", month: "2-digit", year: "numeric" }).format(value.toDate(getLocalTimeZone()))
    : placeholder || t("datePicker.placeholder");

  return (
    <I18nProvider locale={localeTag}>
      <AriaDatePicker className="w-full" shouldCloseOnSelect={false} {...props} value={value} onChange={setValue}>
        <AriaGroup className="w-full">
          <Button
            size="md"
            color="secondary"
            iconLeading={CalendarIcon}
            className="h-11 w-full justify-start font-normal"
          >
            <span className={value ? "text-primary" : "text-placeholder"}>{formattedDate}</span>
          </Button>
        </AriaGroup>
        <AriaPopover
          offset={8}
          placement="bottom left"
          className={({ isEntering, isExiting }) =>
            cx(
              "origin-(--trigger-anchor-point) will-change-transform",
              isEntering &&
                "duration-150 ease-out animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5",
              isExiting &&
                "duration-100 ease-in animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5",
            )
          }
        >
          <AriaDialog className="z-50 overflow-hidden rounded-2xl bg-bg-secondary shadow-xl ring-1 ring-border-secondary">
            {({ close }) => (
              <>
                <div className="flex px-6 py-5">
                  <Calendar highlightedDates={highlightedDates} />
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-border-secondary p-4">
                  <Button
                    size="md"
                    color="secondary"
                    onClick={() => {
                      onCancel?.();
                      close();
                    }}
                  >
                    {t("datePicker.cancel")}
                  </Button>
                  <Button
                    size="md"
                    color="primary"
                    onClick={() => {
                      onApply?.();
                      close();
                    }}
                  >
                    {t("datePicker.apply")}
                  </Button>
                </div>
              </>
            )}
          </AriaDialog>
        </AriaPopover>
      </AriaDatePicker>
    </I18nProvider>
  );
};
