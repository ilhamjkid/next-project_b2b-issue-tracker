import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "B2B Issue Tracker",
    template: "%s | B2B Issue Tracker",
  },
  description: "Efficient client support and issue tracking system.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
