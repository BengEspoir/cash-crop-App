const FEE_VERSION = 'marginal-xaf-v1';
const MINIMUM_FEE_XAF = 2000;
const TIERS = [
  { upTo: 50000, rate: 0.05 },
  { upTo: 250000, rate: 0.0525 },
  { upTo: 1000000, rate: 0.055 },
  { upTo: 5000000, rate: 0.0575 },
  { upTo: Infinity, rate: 0.06 }
];

const calculatePlatformFee = (grossAmount) => {
  const gross = Math.max(0, Math.round(Number(grossAmount) || 0));
  let previousLimit = 0;
  let calculated = 0;
  const breakdown = [];

  for (const tier of TIERS) {
    const taxable = Math.max(0, Math.min(gross, tier.upTo) - previousLimit);
    if (taxable > 0) {
      const fee = taxable * tier.rate;
      calculated += fee;
      breakdown.push({ from: previousLimit, to: Number.isFinite(tier.upTo) ? tier.upTo : null, amount: taxable, rate: tier.rate, fee: Math.round(fee) });
    }
    if (gross <= tier.upTo) break;
    previousLimit = tier.upTo;
  }

  const platformFee = gross > 0 ? Math.max(MINIMUM_FEE_XAF, Math.round(calculated)) : 0;
  return {
    version: FEE_VERSION,
    currency: 'XAF',
    borneBy: 'seller',
    grossAmount: gross,
    calculatedFee: Math.round(calculated),
    minimumFee: MINIMUM_FEE_XAF,
    platformFee,
    sellerNetAmount: Math.max(0, gross - platformFee),
    breakdown
  };
};

module.exports = {
  FEE_VERSION,
  MINIMUM_FEE_XAF,
  TIERS,
  calculatePlatformFee
};
