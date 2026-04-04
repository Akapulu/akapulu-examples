import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Akapulu prebuilt-ui",
  description: "Prebuilt conversation UI example (@akapulu/react-ui) with Next.js App Router API routes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ padding: 0, margin: 0 }} className={inter.className}>{children}</body>
    </html>
  );
}
