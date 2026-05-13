import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sauna Briefs — All The Heat. None Of The Damage.",
  description: "The Original Sauna Briefs™ — with a built-in ice pack pouch. Sauna as long as you want, without cooking your testosterone or fertility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
