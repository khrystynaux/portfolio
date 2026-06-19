import type { Metadata } from "next";
import { Arvo, Nunito, Libre_Franklin } from "next/font/google";
import "./globals.css";

const arvo = Arvo({
  variable: "--font-arvo",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Khrystyna Arnoldy — UX/Product Designer",
  description:
    "Lead UX/UI Designer specializing in B2B SaaS. Designing for clarity, from first research question to shipped product.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${arvo.variable} ${nunito.variable} ${libreFranklin.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
