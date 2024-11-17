import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { FOCUS_FONT } from "@/utils/styles";
import Head from 'next/head';

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
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <html lang="en">
        <body className={FOCUS_FONT.className}>
          {children} 
        </body>
      </html>
    </>
  );
}
