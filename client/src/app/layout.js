import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";
import { buildMetadata } from "../lib/seo";
import { Providers } from "./providers";
import { BRAND_FAVICON_SRC } from "../lib/brandAssets";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agriculnet.example.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  ...buildMetadata("home"),
  applicationName: "AgriculNet",
  icons: {
    icon: [{ url: BRAND_FAVICON_SRC, type: "image/svg+xml" }],
    shortcut: [BRAND_FAVICON_SRC],
    apple: [{ url: "/images/agriculnet_favicon_512.png", sizes: "512x512", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#2E7D32",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${publicSans.variable} ${fraunces.variable} min-h-screen bg-[#F9FAFB] font-sans text-[#111827] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
