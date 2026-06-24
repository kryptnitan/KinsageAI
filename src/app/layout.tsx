import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";

const sansFont = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kinsage | Private AI-Powered Family Intelligence Vault",
  description: "Preserve generations of family stories, memories, traditions, voice recordings, and life lessons in a secure, interactive, and searchable AI-powered family archive.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Kinsage | Private AI-Powered Family Intelligence Vault",
    description: "Preserve family wisdom across generations with semantic search and interactive AI companions.",
    url: "https://kinsage.ai",
    siteName: "Kinsage",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#040815] text-[#f8fafc]">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}

