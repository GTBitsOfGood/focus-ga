import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";

const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
});

export const metadata: Metadata = {
  title: "Focus Community Page",
  description: "Community page for families who are registered under FOCUS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lato.className}>
        {children} 
      </body>
    </html>
  );
}
