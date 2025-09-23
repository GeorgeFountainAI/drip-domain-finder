/**
 * Credit Pack Configuration - Single Source of Truth
 * Business Rule: SINGLE PACK ONLY - $5 buys 10 credits
 */

export interface CreditPack {
  id: string;
  name: string;
  priceUsd: number;
  credits: number;
  stripePriceId: string;
  description: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'pack_10',
    name: '10 Credits',
    priceUsd: 5,
    credits: 10,
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID_5_USD || 'price_1234567890',
    description: 'Perfect for getting started'
  }
];

export const getCreditPackById = (id: string): CreditPack | undefined => {
  return CREDIT_PACKS.find(pack => pack.id === id);
};

export const getCreditPackByStripePrice = (priceId: string): CreditPack | undefined => {
  return CREDIT_PACKS.find(pack => pack.stripePriceId === priceId);
};