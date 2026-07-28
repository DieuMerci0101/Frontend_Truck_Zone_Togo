"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");

    pages.push(totalPages);
    return pages;
  };

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          "inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors",
          "hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageNumbers().map((pageNum, index) => (
        <React.Fragment key={index}>
          {pageNum === "..." ? (
            <span className="px-2 py-1 text-sm text-gray-400">...</span>
          ) : (
            <button
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "inline-flex items-center justify-center min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors",
                page === pageNum
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {pageNum}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          "inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors",
          "hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

export { Pagination };
