import { cn } from "../../lib/utils";

export function ContentSection({ eyebrow, title, description, children, className }) {
  return (
    <section className={cn("space-y-4", className)}>
      {eyebrow || title || description ? (
        <div className="space-y-2">
          {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
          {title ? (
            <h2 className="font-display text-[22px] leading-[1.2] text-ink-800">{title}</h2>
          ) : null}
          {description ? <p className="body-copy">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function FeatureGrid({ items, columns = 3 }) {
  const cols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 xl:grid-cols-3",
    4: "md:grid-cols-2 xl:grid-cols-4",
  }[columns] ?? "md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={cn("grid gap-4", cols)}>
      {items.map((item) => (
        <div
          key={item.title}
          className="group rounded-2xl border border-ink-200 bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
        >
          {item.icon ? (
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-800 transition-colors group-hover:bg-green-800 group-hover:text-white">
              <item.icon className="h-5 w-5" />
            </span>
          ) : null}
          <h3 className="mt-3 font-display text-[17px] leading-[1.25] text-ink-800">{item.title}</h3>
          <p className="mt-2 text-[13px] leading-6 text-ink-700">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

export function Prose({ children, className }) {
  return (
    <div className={cn(
      "max-w-3xl space-y-5 text-[14px] leading-7 text-ink-700",
      "[&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[20px] [&_h2]:text-ink-800",
      "[&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-[16px] [&_h3]:text-ink-800",
      "[&_a]:text-green-800 [&_a]:underline-offset-2 hover:[&_a]:underline",
      "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1",
      "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1",
      className,
    )}>
      {children}
    </div>
  );
}
