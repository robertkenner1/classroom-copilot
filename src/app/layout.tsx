import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Classroom Co-Pilot - Grade 8 Math",
  description: "AI-powered lesson builder for Grade 8 Mathematics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
