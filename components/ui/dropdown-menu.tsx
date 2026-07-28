"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface DropdownMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  danger?: boolean;
  separator?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  className?: string;
}

function DropdownMenu({ trigger, items, align = "left", className }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[180px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg",
            "animate-in fade-in-0 zoom-in-95",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <div
                  key={`separator-${index}`}
                  className="my-1 h-px bg-gray-200"
                />
              );
            }

            const Icon = item.icon;

            return (
              <button
                key={`${item.label}-${index}`}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors text-left",
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { DropdownMenu };
