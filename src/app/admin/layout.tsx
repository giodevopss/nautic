import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel administrativo | Clube Náutico",
  description:
    "Gerencie reservas, cadastros de clientes e Clube VIP, frota e bloqueios de agenda.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
