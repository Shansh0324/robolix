import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 3D Studio — Generate 3D Models with AI",
  description:
    "Create stunning 3D models through natural language. Describe what you want, upload references, and let AI generate production-ready 3D assets.",
  keywords: ["3D", "AI", "generation", "model", "GLB", "three.js"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
