import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { cookies } from "next/headers";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Stock Trading Journal",
  description: "Track and analyze your stock trades across strategy buckets",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("token")?.value;
  const isLoggedIn = Boolean(accessToken);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header isLoggedIn={isLoggedIn} />
        {children}
      </body>
    </html>
  );
}
