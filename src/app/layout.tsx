import type { Metadata } from "next";
import "./globals.css";
import { BookingsProvider } from "@/lib/bookings-context";

export const metadata: Metadata = {
  title: "Playhouse",
  description: "Amenity slot booking for Masters' Union.",
  icons: {
    icon: "/favicon-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Root layout applies to every route, so this is not the pages-router pitfall the rule warns about */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <BookingsProvider>{children}</BookingsProvider>
      </body>
    </html>
  );
}
