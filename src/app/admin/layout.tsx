import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel administrativo | Clube Náutico",
  description:
    "Gerencie reservas, clientes e disponibilidade. Bloqueie datas manualmente na agenda.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
