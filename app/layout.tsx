import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://saunabriefs.com"),
  title: "Sauna Briefs — All The Heat. None Of The Damage.",
  description:
    "Sauna briefs with a built-in ice pack pouch. Protect your fertility and testosterone in the heat. $45, free US shipping.",
  openGraph: {
    title: "Sauna Briefs — All The Heat. None Of The Damage.",
    description: "Sauna briefs with a built-in ice pack pouch. $45, free US shipping.",
    images: [{ url: "/hero.jpg", width: 2560, height: 1440 }],
  },
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
