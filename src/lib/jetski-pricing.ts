/**
 * Tabela oficial — jetski Sea-Doo (GTI 170 SE e GTI 130). Mesmos valores para ambos.
 * Usado na reserva (UI + validação na API).
 */

export type JetskiCategory =
  | "PASSEIO"
  | "PASSEIO_DRONE"
  | "ALUGUEL"
  | "ALUGUEL_DRONE";

export type JetskiProduct = {
  key: string;
  category: JetskiCategory;
  label: string;
  priceBRL: number;
  /** Janela na agenda (início → fim) para checagem de conflitos */
  durationHours: number;
  includesDrone: boolean;
};

const m = (min: number) => min / 60;

/** Passeios: ~1h na agenda (ajuste se o tempo real de rota for outro). */
const PASSEIO_H = 1;
/** Diária: janela de 8h para disponibilidade. */
const DIARIA_H = 8;

export const JETSKI_MODELS_LINE =
  "Sea-Doo GTI 170 SE e GTI 130 — únicos modelos da frota; valores iguais para ambos.";

export const JETSKI_CATEGORY_LABEL: Record<JetskiCategory, string> = {
  PASSEIO: "Passeios",
  PASSEIO_DRONE: "Passeio + drone",
  ALUGUEL: "Aluguel por tempo",
  ALUGUEL_DRONE: "Aluguel + drone",
};

export const JETSKI_PRODUCTS: JetskiProduct[] = [
  // Passeios
  {
    key: "js-pas-planeta",
    category: "PASSEIO",
    label: "Planeta Água",
    priceBRL: 80,
    durationHours: PASSEIO_H,
    includesDrone: false,
  },
  {
    key: "js-pas-ampla",
    category: "PASSEIO",
    label: "Ampla Jacuípe",
    priceBRL: 100,
    durationHours: PASSEIO_H,
    includesDrone: false,
  },
  {
    key: "js-pas-ponte",
    category: "PASSEIO",
    label: "Ponte Jacuípe",
    priceBRL: 120,
    durationHours: PASSEIO_H,
    includesDrone: false,
  },
  {
    key: "js-pas-villas",
    category: "PASSEIO",
    label: "Villas Jacuípe",
    priceBRL: 140,
    durationHours: PASSEIO_H,
    includesDrone: false,
  },
  // Passeio + drone (tabela)
  {
    key: "js-pd-planeta",
    category: "PASSEIO_DRONE",
    label: "Planeta Água + drone",
    priceBRL: 130,
    durationHours: PASSEIO_H,
    includesDrone: true,
  },
  {
    key: "js-pd-ampla",
    category: "PASSEIO_DRONE",
    label: "Ampla Jacuípe + drone",
    priceBRL: 150,
    durationHours: PASSEIO_H,
    includesDrone: true,
  },
  {
    key: "js-pd-ponte",
    category: "PASSEIO_DRONE",
    label: "Ponte Jacuípe + drone",
    priceBRL: 170,
    durationHours: PASSEIO_H,
    includesDrone: true,
  },
  // Aluguel
  {
    key: "js-alu-20",
    category: "ALUGUEL",
    label: "20 minutos",
    priceBRL: 250,
    durationHours: m(20),
    includesDrone: false,
  },
  {
    key: "js-alu-30",
    category: "ALUGUEL",
    label: "30 minutos",
    priceBRL: 350,
    durationHours: m(30),
    includesDrone: false,
  },
  {
    key: "js-alu-45",
    category: "ALUGUEL",
    label: "45 minutos",
    priceBRL: 450,
    durationHours: m(45),
    includesDrone: false,
  },
  {
    key: "js-alu-60",
    category: "ALUGUEL",
    label: "60 minutos",
    priceBRL: 600,
    durationHours: m(60),
    includesDrone: false,
  },
  {
    key: "js-alu-diaria",
    category: "ALUGUEL",
    label: "Diária",
    priceBRL: 1800,
    durationHours: DIARIA_H,
    includesDrone: false,
  },
  // Aluguel + drone
  {
    key: "js-ad-6",
    category: "ALUGUEL_DRONE",
    label: "6 minutos + drone",
    priceBRL: 150,
    durationHours: m(6),
    includesDrone: true,
  },
  {
    key: "js-ad-10",
    category: "ALUGUEL_DRONE",
    label: "10 minutos + drone",
    priceBRL: 180,
    durationHours: m(10),
    includesDrone: true,
  },
  {
    key: "js-ad-15",
    category: "ALUGUEL_DRONE",
    label: "15 minutos + drone",
    priceBRL: 250,
    durationHours: m(15),
    includesDrone: true,
  },
  {
    key: "js-ad-20",
    category: "ALUGUEL_DRONE",
    label: "20 minutos + drone",
    priceBRL: 300,
    durationHours: m(20),
    includesDrone: true,
  },
];

const byKey = new Map(JETSKI_PRODUCTS.map((p) => [p.key, p]));

export function getJetskiProduct(key: string): JetskiProduct | undefined {
  return byKey.get(key);
}

export function jetskiProductsInCategory(
  cat: JetskiCategory,
): JetskiProduct[] {
  return JETSKI_PRODUCTS.filter((p) => p.category === cat);
}

export function jetskiProductLabel(key: string | null | undefined): string {
  if (!key) return "";
  return getJetskiProduct(key)?.label ?? key;
}
