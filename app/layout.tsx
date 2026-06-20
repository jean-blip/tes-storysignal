import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StorySignal",
  description: "A gentle reflection tool for your writing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&family=Geist:wght@300..600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
