import type { Metadata } from "next";
import "@/app/globals.css";
import { ReactNode } from "react";
import { FOCUS_FONT } from "@/utils/consts";

export const metadata: Metadata = {
  title: "Focus Community Platform",
  description: "Community platform for families who are registered under FOCUS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={FOCUS_FONT.className}>
        {children} 
      </body>
    </html>
  );
}
