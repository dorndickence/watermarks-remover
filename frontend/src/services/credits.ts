export type CreditKind = "text" | "image" | "container";

export type CleaningOptions = {
  remove_pixel?: "ctrlregen" | "diffusion" | "";
};

export type CreditPricing = {
  text: number;
  image: number;
  container: number;
  pixelRemoval: number;
};

export type CreditHistoryEntry = {
  id: string;
  timestamp: string;
  delta: number;
  reason: string;
  balanceAfter: number;
};

const defaultPricing: CreditPricing = {
  text: Number(process.env.NEXT_PUBLIC_CREDIT_PRICE_TEXT ?? 1),
  image: Number(process.env.NEXT_PUBLIC_CREDIT_PRICE_IMAGE ?? 5),
  container: Number(process.env.NEXT_PUBLIC_CREDIT_PRICE_CONTAINER ?? 3),
  pixelRemoval: Number(process.env.NEXT_PUBLIC_CREDIT_PRICE_PIXEL_REMOVAL ?? 20),
};

export function getPricing(): CreditPricing {
  return defaultPricing;
}

export function estimateCost(kind: CreditKind, options: CleaningOptions): number {
  const pricing = getPricing();
  let cost = pricing[kind];
  if (kind === "image" && options.remove_pixel) {
    cost += pricing.pixelRemoval;
  }
  return cost;
}
