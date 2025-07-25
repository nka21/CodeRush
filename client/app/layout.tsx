import type { Metadata } from "next";
import { Geist, Geist_Mono, Sixtyfour } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sixtyfour = Sixtyfour({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sixtyfour",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cascadia+Mono:opsz,wght@0.5,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sixtyfour.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
