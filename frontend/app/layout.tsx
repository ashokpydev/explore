import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Explore Hyderabad | AI Tourism and City Guide",
  description:
    "Discover Hyderabad and Telangana with AI itineraries, maps, food guides, events, safety, metro, weather, and local experiences.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/explore-hyderabad-logo.png",
    apple: "/images/explore-hyderabad-logo.png"
  },
  openGraph: {
    title: "Explore Hyderabad",
    description: "AI-powered tourism and city exploration for Hyderabad and Telangana.",
    type: "website",
    images: [
      {
        url: "/images/explore-hyderabad-logo.png",
        width: 1024,
        height: 1024,
        alt: "Explore Hyderabad logo"
      }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#a5243d",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
