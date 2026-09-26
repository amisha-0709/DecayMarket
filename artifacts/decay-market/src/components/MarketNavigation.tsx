import type { LucideIcon } from "lucide-react";
import { Activity, CircleUserRound, ListPlus, Search, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type MarketView = "home" | "browse" | "activity" | "profile";

export interface MarketNavigationProps {
  view: MarketView;
  onNavigate: (view: MarketView) => void;
  onList: () => void;
}

interface NavigationItem {
  view: MarketView;
  label: string;
  icon: LucideIcon;
}

const navigationItems: NavigationItem[] = [
  { view: "home", label: "Home", icon: TrendingDown },
  { view: "browse", label: "Browse", icon: Search },
  { view: "activity", label: "Activity", icon: Activity },
  { view: "profile", label: "Profile", icon: CircleUserRound },
];

/**
 * Primary navigation for the marketplace shell.
 *
 * The same control group changes from a quiet, horizontal desktop bar to a
 * thumb-friendly mobile dock. Keeping the action in one nav makes the
 * component safe to mount once without duplicate interactive targets.
 */
export function MarketNavigation({ view, onNavigate, onList }: MarketNavigationProps) {
  return (
    <header className="relative z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
          >
            <TrendingDown className="size-[18px]" strokeWidth={2.25} />
          </span>
          <span className="font-display text-[15px] font-bold tracking-[-0.02em] text-foreground sm:text-base">
            Decay Market
          </span>
        </div>

        <div className="hidden h-6 w-px bg-border/80 md:block" aria-hidden="true" />

        <nav
          aria-label="Main navigation"
          className={cn(
            "fixed inset-x-3 bottom-3 flex items-center justify-between gap-1 rounded-2xl border border-border/90 bg-card/95 p-1.5 shadow-[0_12px_38px_-20px_oklch(0.21_0.012_65/0.45)] backdrop-blur-xl",
            "md:static md:ml-auto md:flex md:justify-end md:gap-1 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none",
          )}
        >
          {navigationItems.slice(0, 2).map((item) => (
            <NavigationButton
              key={item.view}
              item={item}
              active={view === item.view}
              onNavigate={onNavigate}
            />
          ))}

          <button
            type="button"
            onClick={onList}
            data-testid="market-nav-list"
            aria-label="List an item"
            className={cn(
              "group relative inline-flex min-h-12 min-w-12 shrink-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[10px] font-semibold tracking-[0.01em] transition-[background-color,color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]",
              "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 md:min-h-10 md:flex-none md:flex-row md:gap-2 md:rounded-lg md:px-3.5 md:text-sm",
            )}
          >
            <ListPlus className="size-[18px] md:size-4" strokeWidth={2.2} aria-hidden="true" />
            <span>List</span>
            <span className="sr-only"> an item for neighbors to rescue</span>
          </button>

          {navigationItems.slice(2).map((item) => (
            <NavigationButton
              key={item.view}
              item={item}
              active={view === item.view}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

interface NavigationButtonProps {
  item: NavigationItem;
  active: boolean;
  onNavigate: (view: MarketView) => void;
}

function NavigationButton({ item, active, onNavigate }: NavigationButtonProps) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onNavigate(item.view)}
      data-testid={`market-nav-${item.view}`}
      aria-label={`${item.label}${active ? ", current page" : ""}`}
      aria-current={active ? "page" : undefined}
      data-state={active ? "active" : "inactive"}
      className={cn(
        "group inline-flex min-h-12 min-w-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[10px] font-semibold tracking-[0.01em] text-muted-foreground transition-[background-color,color,transform] duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]",
        "md:min-h-10 md:flex-none md:flex-row md:gap-2 md:rounded-lg md:px-3 md:text-sm",
        active && "bg-accent text-accent-foreground shadow-sm md:bg-accent/80",
      )}
    >
      <Icon
        className={cn("size-[18px] transition-transform duration-200 md:size-4", active && "md:-translate-y-px")}
        strokeWidth={active ? 2.35 : 1.9}
        aria-hidden="true"
      />
      <span>{item.label}</span>
      {active ? <span className="sr-only"> current section</span> : null}
    </button>
  );
}