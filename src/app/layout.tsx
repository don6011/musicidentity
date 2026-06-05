import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RapWriter.ai — Sharpen Your Pen.",
  description: "The premium rap writing studio. Ghost Studio™, Beat Locker™, Pen Coach™, and Booth Ready™ certification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-[#E8E8E8]">
        {children}
      </body>
    </html>
  );
}
