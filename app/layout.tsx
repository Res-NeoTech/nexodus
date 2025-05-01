import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react"
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  description: "Nexodus is a free AI chat platform powered by Mistral, designed to provide intelligent and engaging conversations. Whether you need assistance with daily tasks, want to explore new ideas, or simply enjoy a friendly chat, Nexodus is here to help. Experience the future of communication with our state-of-the-art AI technology.",
  icons: {
    icon: "/favicon.png?v=1",
  },
  keywords: [
    "AI chat",
    "Mistral AI",
    "free chatbot",
    "intelligent conversations",
    "AI assistant",
    "chat with AI",
    "Nexodus chat",
    "AI communication",
    "smart chatbot",
    "AI-powered chat",
    "Nexodus"
  ],
  authors: [{ name: "Maksym (aka NeoTech)", url: "https://maksym.ch" }, { name: "FauZa", url: "https://fauza.fr" }, { name: "Mistral AI", url: "https://mistral.ai" }],
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
        <Suspense fallback={<></>}>
          {children}
        </Suspense>
      </body>
      <Analytics />
    </html>
  );
}
