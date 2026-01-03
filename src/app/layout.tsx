import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SidebarWrapper from "@/components/sideBarWarp";
import Providers from "@/components/providers";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AASTU Slip System",
  description: "A digital system for AASTU students to use as a slip",
  icons: "/favicon.ico"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <SidebarWrapper />
      </body>
    </html>
  );
}
