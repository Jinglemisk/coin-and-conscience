import type {
  PriceCalculationRequest,
  PriceCalculationResult,
  PriceTransactionType,
  TransactionApplicationInput,
  TransactionApplicationResult
} from './pricingTypes';

const clampPrice = (value: number) => Math.max(1, Math.round(value));

const resolveBaseScalar = (transaction: PriceTransactionType, economy: PriceCalculationRequest['economy']) => {
  switch (transaction) {
    case 'restock':
      return economy.restockCostScalar;
    case 'playerBuy':
      return economy.baseBuyMarkdown;
    case 'playerSell':
      return economy.baseSellMarkup;
    default:
      return 1;
  }
};

export const calculatePriceContext = (request: PriceCalculationRequest): PriceCalculationResult => {
  const basePrice = Math.max(0, request.basePrice);
  const multipliers: number[] = [];
  const additives: number[] = [];

  let workingPrice = basePrice;

  const baseScalar = resolveBaseScalar(request.transaction, request.economy);
  multipliers.push(baseScalar);
  workingPrice *= baseScalar;

  if (request.modifiers?.multipliers) {
    request.modifiers.multipliers.forEach((multiplier) => {
      multipliers.push(multiplier);
      workingPrice *= multiplier;
    });
  }

  if (request.modifiers?.additives) {
    request.modifiers.additives.forEach((additive) => {
      additives.push(additive);
      workingPrice += additive;
    });
  }

  const resultingPrice = clampPrice(workingPrice);

  const goldDelta = request.transaction === 'playerSell' ? resultingPrice : -resultingPrice;

  return {
    transaction: request.transaction,
    basePrice,
    resultingPrice,
    goldDelta,
    appliedMultipliers: multipliers,
    appliedAdditives: additives,
    metadata: request.metadata ?? {}
  };
};

export const applyTransaction = ({ gold, price }: TransactionApplicationInput): TransactionApplicationResult => {
  const goldAfter = gold + price.goldDelta;

  if (price.goldDelta < 0 && goldAfter < 0) {
    return {
      success: false,
      goldAfter: gold,
      goldDelta: price.goldDelta,
      reason: 'insufficientGold',
      requiredGold: Math.abs(price.goldDelta)
    };
  }

  return {
    success: true,
    goldAfter,
    goldDelta: price.goldDelta
  };
};
