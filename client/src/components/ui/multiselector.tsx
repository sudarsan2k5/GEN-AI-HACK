import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { X } from "lucide-react";
import * as React from "react";
import { forwardRef, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

/* Empty State */
const CommandEmpty = forwardRef(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);
  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn("py-6 text-center text-sm", className)}
      role="presentation"
      {...props}
    />
  );
});
CommandEmpty.displayName = "CommandEmpty";

/* Multiple Selector */
const MultipleSelector = React.forwardRef(
  (
    {
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay = 500,
      onSearch,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
    },
    ref
  ) => {
    const inputRef = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const mouseOn = React.useRef(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const [selected, setSelected] = React.useState(value || []);
    const [options, setOptions] = React.useState(
      transToGroupOption(arrayDefaultOptions, groupBy)
    );
    const [inputValue, setInputValue] = React.useState("");
    const debouncedSearchTerm = useDebounce(inputValue, delay);

    /* Expose methods */
    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current,
        focus: () => inputRef.current?.focus(),
      }),
      [selected]
    );

    /* Handlers */
    const handleUnselect = React.useCallback(
      (option) => {
        const newOptions = selected.filter((s) => s.value !== option.value);
        setSelected(newOptions);
        onChange?.(newOptions);
      },
      [onChange, selected]
    );

    const handleKeyDown = React.useCallback(
      (e) => {
        const input = inputRef.current;
        if (!input) return;

        if ((e.key === "Delete" || e.key === "Backspace") && input.value === "" && selected.length > 0) {
          const lastSelectOption = selected[selected.length - 1];
          if (!lastSelectOption.fixed) {
            handleUnselect(lastSelectOption);
          }
        }
        if (e.key === "Escape") input.blur();
      },
      [handleUnselect, selected]
    );

    /* Sync value prop */
    useEffect(() => {
      if (value) setSelected(value);
    }, [value]);

    /* Sync options when provided locally */
    useEffect(() => {
      if (!arrayOptions || onSearch) return;
      setOptions(transToGroupOption(arrayOptions || [], groupBy));
    }, [arrayOptions, arrayDefaultOptions, groupBy, onSearch]);

    /* Async search */
    useEffect(() => {
      if (!onSearch || !open) return;

      const doSearch = async () => {
        setIsLoading(true);
        const res = await onSearch(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
        setIsLoading(false);
      };

      if (triggerSearchOnFocus || debouncedSearchTerm) {
        void doSearch();
      }
    }, [debouncedSearchTerm, groupBy, open, onSearch, triggerSearchOnFocus]);

    /* Creatable item */
    const CreatableItem = () => {
      if (!creatable || !inputValue.trim()) return null;

      const alreadyExists =
        isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
        selected.some((s) => s.value === inputValue);

      if (alreadyExists) return null;

      const item = (
        <CommandItem
          value={inputValue}
          className="cursor-pointer"
          onMouseDown={(e) => e.preventDefault()}
          onSelect={(value) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length);
              return;
            }
            setInputValue("");
            const newOptions = [...selected, { value, label: value }];
            setSelected(newOptions);
            onChange?.(newOptions);
          }}
        >
          {`Create "${inputValue}"`}
        </CommandItem>
      );

      if (!onSearch || (debouncedSearchTerm && !isLoading)) {
        return item;
      }
      return null;
    };

    /* Empty state */
    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return null;
      if (onSearch && !creatable && Object.keys(options).length === 0) {
        return (
          <CommandItem value="-" disabled>
            {emptyIndicator}
          </CommandItem>
        );
      }
      return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
    }, [creatable, emptyIndicator, onSearch, options]);

    /* Selectable options */
    const selectables = React.useMemo(
      () => removePickedOption(options, selected),
      [options, selected]
    );

    /* Custom filter */
    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) return commandProps.filter;
      if (creatable) {
        return (value, search) =>
          value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
      }
      return undefined;
    }, [creatable, commandProps?.filter]);

    const shouldHideClearAll =
      hideClearAllButton ||
      disabled ||
      selected.length === 0 ||
      selected.every((s) => s.fixed);

    return (
      <Command
        {...commandProps}
        onKeyDown={(e) => {
          handleKeyDown(e);
          commandProps?.onKeyDown?.(e);
        }}
        className={cn(
          "h-auto overflow-visible bg-transparent",
          commandProps?.className
        )}
        shouldFilter={
          commandProps?.shouldFilter !== undefined
            ? commandProps.shouldFilter
            : !onSearch
        }
        filter={commandFilter()}
      >
        {/* Input + Selected Badges */}
        <div
          className={cn(
            "min-h-10 rounded-md border border-input text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            {
              "px-3 py-2": selected.length !== 0,
              "cursor-text": !disabled && selected.length !== 0,
            },
            className
          )}
          onClick={() => !disabled && inputRef.current?.focus()}
        >
          <div className="flex flex-wrap gap-3">
            {selected.map((option) => (
              <Badge
                key={option.value}
                className={cn(
                  "bg-purple-500 p-2",
                  "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted",
                  "data-[disabled]:bg-muted-foreground data-[disabled]:text-muted",
                  badgeClassName
                )}
                data-fixed={option.fixed}
                data-disabled={disabled || undefined}
              >
                {option.label}
                <button
                  aria-label={`Remove ${option.label}`}
                  className={cn(
                    "ml-1 rounded-full text-white outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    (disabled || option.fixed) && "hidden"
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleUnselect(option)}
                >
                  <X className="h-4 w-4 text-white hover:text-purple-500" />
                </button>
              </Badge>
            ))}

            <CommandPrimitive.Input
              {...inputProps}
              ref={inputRef}
              value={inputValue}
              disabled={disabled}
              onValueChange={(val) => {
                setInputValue(val);
                inputProps?.onValueChange?.(val);
              }}
              onBlur={(e) => {
                if (!mouseOn.current) setOpen(false);
                inputProps?.onBlur?.(e);
              }}
              onFocus={(e) => {
                setOpen(true);
                triggerSearchOnFocus && onSearch?.(debouncedSearchTerm);
                inputProps?.onFocus?.(e);
              }}
              placeholder={
                hidePlaceholderWhenSelected && selected.length > 0
                  ? ""
                  : placeholder
              }
              className={cn(
                "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
                {
                  "w-full": hidePlaceholderWhenSelected,
                  "px-3 py-2": selected.length === 0,
                  "ml-1": selected.length !== 0,
                },
                inputProps?.className
              )}
            />

            {/* Clear All */}
            <button
              type="button"
              aria-label="Clear all selections"
              onClick={() => setSelected(selected.filter((s) => s.fixed))}
              className={cn(shouldHideClearAll && "hidden")}
            >
              <X />
            </button>
          </div>
        </div>

        {/* Dropdown List */}
        <div className="relative">
          {open && (
            <CommandList
              role="listbox"
              className="absolute top-1 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in"
              onMouseLeave={() => (mouseOn.current = false)}
              onMouseEnter={() => (mouseOn.current = true)}
              onMouseUp={() => inputRef.current?.focus()}
            >
              {isLoading && <div className="p-2">{loadingIndicator}</div>}

              {EmptyItem()}
              {CreatableItem()}
              {!selectFirstItem && <CommandItem value="-" className="hidden" />}

              {Object.entries(selectables).map(([key, dropdowns]) => (
                <CommandGroup key={key} heading={key} className="h-full overflow-auto">
                  {dropdowns.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      role="option"
                      aria-selected={selected.some((s) => s.value === option.value)}
                      disabled={option.disable}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={() => {
                        if (selected.length >= maxSelected) {
                          onMaxSelected?.(selected.length);
                          return;
                        }
                        setInputValue("");
                        const newOptions = [...selected, option];
                        setSelected(newOptions);
                        onChange?.(newOptions);
                      }}
                      className={cn(
                        "cursor-pointer",
                        option.disable && "cursor-default text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          )}
        </div>
      </Command>
    );
  }
);

MultipleSelector.displayName = "MultipleSelector";
export default MultipleSelector;

/* Helpers */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function transToGroupOption(options, groupBy) {
  if (!options || options.length === 0) return {};
  if (!groupBy) return { "": options };

  return options.reduce((acc, option) => {
    const key = option[groupBy] || "";
    acc[key] = acc[key] || [];
    acc[key].push(option);
    return acc;
  }, {});
}

function removePickedOption(groupOption, picked) {
  const pickedSet = new Set(picked.map((p) => p.value));
  return Object.fromEntries(
    Object.entries(groupOption).map(([key, value]) => [
      key,
      value.filter((opt) => !pickedSet.has(opt.value)),
    ])
  );
}

function isOptionsExist(groupOption, targetOption) {
  return Object.values(groupOption).some((options) =>
    options.some((opt) => targetOption.some((p) => p.value === opt.value))
  );
}
