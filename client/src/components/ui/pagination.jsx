import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)

const PaginationContent = ({ className, ...props }) => (
  <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />
)

const PaginationItem = ({ className, ...props }) => (
  <li className={cn("", className)} {...props} />
)

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}) => (
  <Button
    aria-current={isActive ? "page" : undefined}
    variant={isActive ? "outline" : "ghost"}
    size={size}
    className={cn(
      "w-10 h-10",
      isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
      className
    )}
    {...props}
  />
)

const PaginationPrevious = ({
  className,
  ...props
}) => (
  <Button
    variant="ghost"
    size="icon"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </Button>
)

const PaginationNext = ({
  className,
  ...props
}) => (
  <Button
    variant="ghost"
    size="icon"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </Button>
)

const PaginationEllipsis = ({
  className,
  ...props
}) => (
  <div
    role="separator"
    aria-hidden="true"
    className={cn("flex h-10 w-10 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </div>
)

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}