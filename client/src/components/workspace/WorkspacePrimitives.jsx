import Link from "next/link";
import { ArrowLeft, Package, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function workspaceInitials(user, fallback = "UN") {
  return (
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || fallback
  );
}

export function workspaceDisplayName(user, fallback = "User") {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || fallback;
}

export function formatWorkspaceDate(value, fallback = "Pending") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function compactWorkspaceCurrency(value) {
  if (typeof value === "string") return value;
  const amount = Number(value || 0);
  if (amount >= 1000000) {
    return `XAF ${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
  }
  if (amount >= 1000) {
    return `XAF ${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  }
  return `XAF ${amount.toLocaleString("en-US")}`;
}

export function WorkspacePage({ children, className }) {
  return <section className={cn("space-y-8", className)}>{children}</section>;
}

export function WorkspaceHeader({
  title,
  description,
  action,
  backHref,
  backLabel = "Back",
  className,
  titleClassName,
  titleWeightClassName = "font-bold",
}) {
  return (
    <div
      className={cn(
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {backHref ? (
          <Link
            href={backHref}
            className="focus-ring mb-5 inline-flex items-center gap-2 rounded-md text-[15px] font-medium text-ink-500 transition-all duration-200 hover:text-green-800 motion-safe:hover:-translate-x-0.5"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Link>
        ) : null}
        <h1
          className={cn(
            "font-display text-[34px] leading-tight tracking-normal text-ink-950 md:text-[42px]",
            titleWeightClassName,
            titleClassName,
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-[18px] leading-7 text-ink-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function WorkspaceButton({
  href,
  children,
  variant = "primary",
  icon: Icon,
  className,
  disabled,
  ...props
}) {
  const classes = cn(
    "focus-ring inline-flex h-14 items-center justify-center gap-3 rounded-lg px-6 text-[16px] font-bold transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md",
    variant === "primary" && "bg-green-800 text-white hover:bg-green-900",
    variant === "gold" && "bg-amber-600 text-white hover:bg-amber-700",
    variant === "outline" &&
      "border border-ink-200 bg-white text-ink-700 hover:border-green-700 hover:text-green-800",
    variant === "ghost" && "bg-transparent text-green-800 hover:bg-green-50",
    disabled && "pointer-events-none opacity-60",
    className,
  );
  const content = (
    <>
      {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
      <span>{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} disabled={disabled} {...props}>
      {content}
    </button>
  );
}

export function WorkspacePanel({ title, action, children, className, bodyClassName }) {
  return (
    <section
      className={cn(
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 overflow-hidden rounded-2xl border border-ink-200 bg-white transition-shadow duration-200 hover:shadow-sm",
        className,
      )}
    >
      {title || action ? (
        <div className="flex min-h-20 items-center justify-between gap-4 border-b border-ink-100 px-6 py-5">
          {title ? (
            <h2 className="font-display text-[22px] font-bold tracking-normal text-ink-950">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

const defaultMetricTones = {
  green: "bg-green-50 text-green-800",
  blue: "bg-sky-50 text-sky-800",
  gold: "bg-amber-50 text-amber-800",
  cyan: "bg-cyan-50 text-cyan-800",
  neutral: "bg-ink-50 text-ink-600",
};

export function WorkspaceMetricCard({
  icon: Icon = Package,
  value,
  label,
  detail,
  tag,
  tone = "green",
  toneClasses = defaultMetricTones,
  tagClassName = "bg-green-50 text-green-800",
  valueClassName = "font-semibold",
}) {
  return (
    <article className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 rounded-2xl border border-ink-200 bg-white p-7 transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "inline-flex h-14 w-14 items-center justify-center rounded-xl",
            toneClasses[tone] || toneClasses.green,
          )}
        >
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        {tag ? (
          <span className={cn("rounded-full px-4 py-1.5 text-[13px] font-bold", tagClassName)}>
            {tag}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-7 font-display text-[42px] leading-none tracking-normal text-ink-950",
          valueClassName,
        )}
      >
        {value}
      </p>
      <p className="mt-3 text-[14px] font-bold uppercase tracking-[0.12em] text-ink-400">{label}</p>
      {detail ? <p className="mt-2 text-[16px] text-ink-500">{detail}</p> : null}
    </article>
  );
}

export function workspaceStatusClass(status, terms = {}) {
  const normalized = String(status || "pending").toLowerCase();
  const positive = terms.positive || ["active", "verified", "released", "delivered", "complete"];
  const informational = terms.informational || ["transit", "escrow"];
  const negative = terms.negative || ["cancel", "reject", "failed"];

  const classes = {
    positive: "bg-green-50 text-green-800",
    informational: "bg-cyan-50 text-cyan-800",
    negative: "bg-red-50 text-red-800",
    pending: "bg-amber-50 text-amber-800",
    ...terms.classes,
  };

  if (positive.some((term) => normalized.includes(term))) return classes.positive;
  if (informational.some((term) => normalized.includes(term))) return classes.informational;
  if (negative.some((term) => normalized.includes(term))) return classes.negative;
  return classes.pending;
}

export function WorkspaceStatusBadge({ status = "pending", children, className, terms }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-4 py-1.5 text-[13px] font-bold",
        workspaceStatusClass(status, terms),
        className,
      )}
    >
      {children || status}
    </span>
  );
}

export function WorkspaceFilters({
  searchPlaceholder = "Search...",
  filterOptions = [],
  values = {},
  onChange,
  actions,
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1 lg:max-w-[420px]">
        <Search
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={values.q || ""}
          onChange={(event) => onChange?.("q", event.target.value)}
          className="h-14 w-full rounded-lg border border-ink-200 bg-white pl-14 pr-4 text-[16px] text-ink-800 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-800/10"
        />
      </div>
      {filterOptions.map((filter) => (
        <label
          key={filter.key}
          className="focus-ring inline-flex h-14 items-center justify-between gap-3 rounded-lg border border-ink-200 bg-white px-5 text-[16px] font-medium text-ink-700 transition-all duration-200 hover:border-green-700 hover:text-green-800 motion-safe:hover:-translate-y-0.5"
        >
          <span className="sr-only">{filter.label}</span>
          <select
            value={values[filter.key] || "all"}
            onChange={(event) => onChange?.(filter.key, event.target.value)}
            className="h-full min-w-[130px] bg-transparent outline-none"
          >
            {(filter.options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden="true" />
        </label>
      ))}
      {actions}
    </div>
  );
}

export function WorkspaceEmptyState({ icon: Icon, title, description, action, className, titleClassName, titleFontClassName = "font-display" }) {
  return (
    <div className={cn("flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-10 text-center", className)}>
      {Icon ? <Icon className="h-12 w-12 text-ink-300" aria-hidden="true" /> : null}
      <h3 className={cn("mt-4 text-[20px] font-bold text-ink-950", titleFontClassName, titleClassName)}>{title}</h3>
      {description ? (
        <p className="mt-2 max-w-lg text-[15px] leading-6 text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
