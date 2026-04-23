import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { buildMetadata } from "../lib/seo";

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
  themeColor: "#0D3D22",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmSerif.variable} min-h-screen bg-[#F9FAFB] font-sans text-[#111827] antialiased`}>
        {children}
      </body>
    </html>
  );
}
