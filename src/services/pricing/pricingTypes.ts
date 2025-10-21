export type PriceTransactionType = 'restock' | 'playerBuy' | 'playerSell';

export interface PriceCalculationRequest {
  basePrice: number;
  transaction: PriceTransactionType;
  economy: {
    restockCostScalar: number;
    baseSellMarkup: number;
    baseBuyMarkdown: number;
  };
  modifiers?: {
    /** Additional multiplicative factors applied after the base economy scalar. */
    multipliers?: readonly number[];
    /** Additive adjustments applied after all multipliers. */
    additives?: readonly number[];
  };
  metadata?: Record<string, unknown>;
}

export interface PriceCalculationResult {
  transaction: PriceTransactionType;
  basePrice: number;
  resultingPrice: number;
  goldDelta: number;
  appliedMultipliers: readonly number[];
  appliedAdditives: readonly number[];
  metadata: Record<string, unknown>;
}

export interface TransactionApplicationInput {
  gold: number;
  price: PriceCalculationResult;
}

export interface TransactionApplicationResult {
  success: boolean;
  goldAfter: number;
  goldDelta: number;
  reason?: 'insufficientGold';
  requiredGold?: number;
}
