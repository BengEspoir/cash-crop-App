import Link from "next/link";

const columns = [
  {
    title: "Marketplace",
    items: [
      { label: "Browse Crops", href: "/browse" },
      { label: "Find Farmers", href: "/find-farmers" },
      { label: "Buyer Protection", href: "/buyer-protection" },
      { label: "Request a Quote", href: "/request-quote" },
    ],
  },
  {
    title: "For Sellers",
    items: [
      { label: "Farmer Verification", href: "/verification" },
      { label: "Trade Support", href: "/trade-support" },
      { label: "Pricing", href: "/pricing" },
      { label: "Inspections", href: "/inspections-info" },
    ],
  },
  {
    title: "For Buyers",
    items: [
      { label: "Export Program", href: "/international" },
      { label: "Protected Orders", href: "/buyer-protection" },
      { label: "Logistics", href: "/logistics-info" },
      { label: "Documentation", href: "/documentation-info" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help Center", href: "/help" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Contact Team", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-green-900 text-white">
      <div className="content-shell grid gap-10 py-12 lg:grid-cols-[1.15fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <Link href="/" className="inline-flex font-display text-[22px] leading-none">
            <span className="text-white">Agricul</span>
            <span className="text-gold-400">Net</span>
          </Link>
          <p className="max-w-sm text-[14px] leading-6 text-white/84">
            Trusted crop sourcing for local and international buyers, with verified farmers, protected payments, and coordinated logistics.
          </p>
          <p className="max-w-sm text-[12px] leading-5 text-gold-100">
            Des fermes camerounaises aux marchés du monde
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60">
              {column.title}
            </p>
            <ul className="space-y-2.5 text-[13px] text-white/84">
              {column.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="focus-ring rounded-sm transition-colors duration-200 hover:text-gold-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="content-shell flex flex-col items-start justify-between gap-2 py-4 text-[12px] text-white/60 lg:flex-row lg:items-center">
          <p>© {new Date().getFullYear()} AgriculNet. Built for Cameroonian agriculture.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="focus-ring rounded-sm hover:text-gold-400">Terms</Link>
            <Link href="/privacy" className="focus-ring rounded-sm hover:text-gold-400">Privacy</Link>
            <Link href="/contact" className="focus-ring rounded-sm hover:text-gold-400">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
