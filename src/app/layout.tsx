import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@xyflow/react/dist/style.css';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Matter Intake System",
  description: "Drag-and-Drop Form Builder & Workflow Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar - hidden on mobile, visible on desktop */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          
          {/* Mobile sidebar overlay */}
          <div className="md:hidden">
            <Sidebar />
          </div>
          
          <div className="flex flex-1 flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}