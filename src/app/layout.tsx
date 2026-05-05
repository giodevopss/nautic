import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Clube Náutico | Experiências Exclusivas no Mar",
  description:
    "Aluguel de lanchas e jetskis com conforto, segurança e liberdade. Viva experiências premium no mar.",
  keywords: [
    "clube náutico",
    "aluguel lanchas",
    "aluguel jetski",
    "passeios de barco",
    "experiências náuticas",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
