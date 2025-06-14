import React, { cloneElement, forwardRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { ChevronRightIcon } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverVerticalEllipseTrigger,
} from "@/components/popover";

type TableProps = {
  containerClassName?: string;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
};

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, children, fullWidth }, ref) => {
    return (
      <div
        className={cn(
          "overflow-x-auto whitespace-nowrap rounded-md border scrollbar-thin scrollbar-track-muted/10 scrollbar-thumb-muted",
          containerClassName,
          fullWidth && "w-full"
        )}
      >
        <table ref={ref} className={cn("w-full divide-y", className)}>
          {children}
        </table>
      </div>
    );
  }
);

type TableHeaderProps = {
  className?: string;
  children: ReactNode;
};

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(
          "rounded-t-md",
          "relative divide-y divide-border bg-muted",
          className
        )}
      >
        {children}
      </thead>
    );
  }
);

type TableBodyProps = {
  className?: string;
  children: ReactNode;
};

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn("relative divide-y divide-border", className)}
      >
        {children}
      </tbody>
    );
  }
);

type TableRowProps = {
  className?: string;
  children: ReactNode;
  disabled?: boolean;
};

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, disabled, children }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(disabled && "opacity-50", "group w-full", className)}
      >
        {children}
      </tr>
    );
  }
);

type TableCellBasicProps = {
  className?: string;
  alignment?: "left" | "center" | "right";
  children: ReactNode;
  colSpan?: number;
};

type TableHeaderCellProps = TableCellBasicProps & {
  hiddenLabel?: boolean;
};

const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  (
    { className, alignment = "left", children, colSpan, hiddenLabel = false },
    ref
  ) => {
    let alignmentClassName = "text-left";
    switch (alignment) {
      case "center":
        alignmentClassName = "text-center";
        break;
      case "right":
        alignmentClassName = "text-right";
        break;
      case "left":
        alignmentClassName = "text-left";
        break;
      default:
        alignmentClassName = "text-left";
        break;
    }

    return (
      <th
        ref={ref}
        scope="col"
        className={cn(
          "px-4 py-2 align-middle text-xs font-normal uppercase tracking-wider",
          alignmentClassName,
          className
        )}
        colSpan={colSpan}
      >
        {hiddenLabel ? <span className="sr-only">{children}</span> : children}
      </th>
    );
  }
);

type TableCellProps = TableCellBasicProps & {
  link?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  hasAction?: boolean;
  isSticky?: boolean;
  hover?: boolean;
};

const stickyStyles =
  "sticky right-0 z-10 w-[2.8rem] min-w-[2.8rem] bg-background before:absolute before:pointer-events-none before:-left-8 before:top-0 before:h-full before:min-w-[2rem] before:bg-gradient-to-r before:from-transparent before:to-background before:content-[''] dark:group-hover:before:to-neutral-900 group-hover:before:to-neutral-50";

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  (
    {
      className,
      alignment = "left",
      children,
      colSpan,
      link,
      onClick,
      hover,
      hasAction = false,
      isSticky = false,
    },
    ref
  ) => {
    let alignmentClassName = "text-left";
    switch (alignment) {
      case "center":
        alignmentClassName = "text-center";
        break;
      case "right":
        alignmentClassName = "text-right";
        break;
      case "left":
        alignmentClassName = "text-left";
        break;
      default:
        alignmentClassName = "text-left";
        break;
    }

    const flexClasses = cn(
      "flex w-full whitespace-nowrap px-4 py-3 text-xs text-muted-foreground",
      alignment === "left"
        ? "justify-start text-left"
        : alignment === "center"
          ? "justify-center text-center"
          : "justify-end text-right"
    );

    return (
      <td
        ref={ref}
        className={cn(
          "text-xs text-muted-foreground",
          link || onClick || hasAction
            ? "p-0 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-900"
            : "px-4 py-3 align-middle",
          (link || onClick) && "cursor-pointer",
          hasAction && "pr-4",
          hover && "group-hover:bg-neutral-50 dark:group-hover:bg-neutral-900",
          !link && !onClick && alignmentClassName,
          isSticky && stickyStyles,
          // 'group-hover:bg-neutral-50 dark:group-hover:bg-neutral-900',
          className
        )}
        colSpan={colSpan}
      >
        {link ? (
          // TODO: Fix this
          <Slot className={flexClasses} />
        ) : onClick ? (
          <button onClick={onClick} className={flexClasses} type="button">
            {children}
          </button>
        ) : (
          children
        )}
      </td>
    );
  }
);

const TableCellChevron = forwardRef<
  HTMLTableCellElement,
  {
    className?: string;
    link?: boolean;
    children?: ReactNode;
    isSticky?: boolean;
    hover?: boolean;
    alignment?: "left" | "center" | "right";
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  }
>(({ className, link, children, isSticky, alignment, onClick, hover }, ref) => {
  return (
    <TableCell
      className={className}
      isSticky={isSticky}
      link={link}
      onClick={onClick}
      ref={ref}
      alignment={alignment}
      hover={hover}
    >
      {children}
      <ChevronRightIcon className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
    </TableCell>
  );
});

const TableCellIcon = forwardRef<
  HTMLTableCellElement,
  {
    className?: string;
    link?: boolean;
    children?: ReactNode;
    isSticky?: boolean;
    hover?: boolean;
    alignment?: "left" | "center" | "right";
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    icon: ReactElement;
  }
>(
  (
    { className, link, children, isSticky, alignment, onClick, hover, icon },
    ref
  ) => {
    return (
      <TableCell
        className={className}
        isSticky={isSticky}
        link={link}
        onClick={onClick}
        ref={ref}
        alignment={alignment}
        hover={hover}
      >
        {children}

        {/* add class to icon */}
        {cloneElement(icon, {
          /* @ts-ignore */
          className: cn(
            "h-4 w-4 text-muted-foreground transition group-hover:text-foreground cursor-pointer"
          ),
        })}
      </TableCell>
    );
  }
);

TableCellIcon.displayName = "TableCellIcon";
const TableCellMenu = forwardRef<
  HTMLTableCellElement,
  {
    className?: string;
    children?: ReactNode;
    isSticky?: boolean;
    alignment?: "left" | "center" | "right";
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  }
>(({ className, children, isSticky, onClick, alignment = "right" }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <TableCell
      className={className}
      isSticky={isSticky}
      onClick={onClick}
      ref={ref}
      alignment="right"
      hasAction
    >
      <div
        className={cn(
          "flex h-full w-full",
          alignment === "left"
            ? "justify-start"
            : alignment === "center"
              ? "justify-center"
              : "justify-end"
        )}
      >
        <Popover open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
          <PopoverVerticalEllipseTrigger />

          <PopoverContent
            className="w-fit max-w-[10rem] overflow-y-auto p-0 scrollbar-thin scrollbar-track-muted/10 scrollbar-thumb-muted"
            align="end"
          >
            <div className="flex flex-col p-1">{children}</div>
          </PopoverContent>
        </Popover>
      </div>
    </TableCell>
  );
});

type TableBlankRowProps = {
  className?: string;
  colSpan: number;
  children: ReactNode;
};

const TableBlankRow = forwardRef<HTMLTableRowElement, TableBlankRowProps>(
  ({ children, colSpan, className }, ref) => {
    return (
      <tr ref={ref}>
        <td
          colSpan={colSpan}
          className={cn("px-4 py-3 text-center text-sm", className)}
        >
          {children}
        </td>
      </tr>
    );
  }
);

Table.displayName = "Table";
TableHeader.displayName = "TableHeader";
TableBody.displayName = "TableBody";
TableRow.displayName = "TableRow";
TableHeaderCell.displayName = "TableHeaderCell";
TableCell.displayName = "TableCell";
TableCellChevron.displayName = "TableCellChevron";
TableCellMenu.displayName = "TableCellMenu";
TableBlankRow.displayName = "TableBlankRow";

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableCellChevron,
  TableCellMenu,
  TableBlankRow,
  TableCellIcon,
};
