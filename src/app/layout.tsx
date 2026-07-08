import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wescue - Find Your Perfect Rescue Dog",
  description:
    "Wescue matches you with verified shelter dogs that fit your lifestyle. No breeders. No puppy mills. Ever.",
  openGraph: {
    title: "Wescue - Find Your Perfect Rescue Dog",
    description:
      "AI-powered matching with verified rescue dogs. No breeders. No puppy mills.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
