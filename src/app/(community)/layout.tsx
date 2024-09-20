import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import React from "react";

type CommunityLayoutProps = {
  children: React.ReactNode;
}

export default function CommunityLayout({ children }: CommunityLayoutProps) {
  return (
    <html lang='en'>
      <body>
        <Navbar />
        <Sidebar />
        <div className="ml-[280px] mt-[100px] p-4">
          {children}
        </div>
      </body>
    </html>
  );
}