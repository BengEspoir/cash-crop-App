import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { buildMetadata } from "../lib/seo";
import { Providers } from "./providers";
import { BRAND_FAVICON_SRC } from "../lib/brandAssets";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
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
      <body className={`${dmSans.variable} ${dmSerif.variable} min-h-screen bg-[#F9FAFB] font-sans text-[#111827] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
