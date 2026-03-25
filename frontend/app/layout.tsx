import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OneChain Fantasy Sports",
  description: "Build teams. Earn points. Trade NFTs. Win crypto.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <AppProviders>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(224 71% 7%)",
                border: "1px solid hsl(216 34% 17%)",
                color: "hsl(213 31% 91%)",
              },
            }}
          />
        </AppProviders>
      </body>
    </html>
  );
}
