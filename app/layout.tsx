import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Safarlink Parcel — Track your parcel",
  description: "A simple, secure read-only parcel tracking service by Safarlink.",
  applicationName: "Safarlink Parcel",
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
