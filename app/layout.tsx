import "./globals.css";
import type { Metadata } from "next";
import Header from "./header";

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
      <body>
        {/* Top header: logo + logout */}
        <Header />

        {/* Your existing app UI from app/page.tsx */}
        {children}
      </body>
    </html>
  );
}
