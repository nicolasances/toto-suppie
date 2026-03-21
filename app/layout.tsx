import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import { MainLayout } from "./components/MainLayout";

export const metadata: Metadata = {
  title: "Toto Suppie",
  description: "Your smart shopping list",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://accounts.google.com/gsi/client" async></script>
      </head>
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
