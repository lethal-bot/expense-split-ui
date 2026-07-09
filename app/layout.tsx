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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="relative min-h-screen">
        {children}
        <NavigationBar />
      </body>
    </html>
  );
}
