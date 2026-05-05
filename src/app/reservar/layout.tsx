import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reserva online | Clube Náutico",
  description:
    "Reserve lancha ou jetski: escolha data, horário e duração. Clube Náutico.",
};

export default function ReservarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
