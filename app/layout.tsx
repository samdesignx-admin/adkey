import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adkey — Every Ad. One Key.",
  description: "Turn every advertisement into a measurable digital experience."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}