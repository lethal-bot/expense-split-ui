import type { Metadata } from "next";
import "./globals.css";
import NavigationBar from "@/components/custom/NavigationBar";

export const metadata: Metadata = {
  title: "Three Friends Split",
  description: "A simple frontend for splitting expenses between friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative min-h-screen">
        {children}
        <NavigationBar />
      </body>
    </html>
  );
}
