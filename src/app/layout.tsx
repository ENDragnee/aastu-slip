import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Image from "next/image"; // Import the Image component
import aastuImage from '../../public/AASTU.jpg'

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col text-center items-center justify-center">
        <Image
            src={aastuImage}
            alt="AASTU Logo"
            width={150} // Adjust the width
            height={150} // Adjust the height
            className="mb-6"
          />
        </div>
        {children}
      </body>
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#cccccc] text-center text-[#003366] shadow-lg">
        <p className="text-sm">
          Created and powered by AASTU SAAS Founders Club <span className="text-[#b8860b]">2024</span>
        </p>
      </footer>
    </html>
  );
}
