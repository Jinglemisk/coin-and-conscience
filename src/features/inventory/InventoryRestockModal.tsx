import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { useConfigStore } from '@/app/providers';
import { listItemTemplates, type ItemTemplate } from '@/data/items';
import { useGlobalStatsStore } from '@/features/stats/globalStatsStore';
import { useInventoryStore } from './inventoryStore';
import { applyTransaction, calculatePriceContext } from '@/services/pricing';
import type { PriceCalculationResult } from '@/services/pricing';

interface InventoryRestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWeekend: boolean;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.35)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 20,
  padding: '1.5rem'
};

const modalStyle: CSSProperties = {
  width: 'min(860px, 100%)',
  maxHeight: '90vh',
  background: '#ffffff',
  borderRadius: '1rem',
  border: '1px solid #d7d7d7',
  boxShadow: '0 18px 48px rgba(0, 0, 0, 0.18)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const modalHeaderStyle: CSSProperties = {
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid #ebebeb',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem'
};

const closeButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  fontSize: '1.6rem',
  lineHeight: 1,
  cursor: 'pointer',
  color: '#666'
};

const contentStyle: CSSProperties = {
  padding: '1.25rem 1.5rem',
  overflowY: 'auto'
};

const offersGridStyle: CSSProperties = {
  display: 'grid',
  gap: '1rem'
};

const offerCardStyle: CSSProperties = {
  border: '1px solid #e4e4e4',
  borderRadius: '0.85rem',
  padding: '1rem 1.25rem',
  background: '#fafafa'
};

const purchaseButtonStyle: CSSProperties = {
  padding: '0.5rem 0.9rem',
  borderRadius: '0.6rem',
  border: '1px solid #3a6ac9',
  background: '#4a80ff',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer'
};

const disabledPurchaseButtonStyle: CSSProperties = {
  ...purchaseButtonStyle,
  border: '1px solid #c2c8d6',
  background: '#d6dbea',
  color: '#6d7487',
  cursor: 'not-allowed'
};

const statusBannerStyle: CSSProperties = {
  marginTop: '0.75rem',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  fontSize: '0.85rem'
};

const successBannerStyle: CSSProperties = {
  ...statusBannerStyle,
  background: '#e8f6ff',
  border: '1px solid #a2d4ff',
  color: '#1a5ca1'
};

const errorBannerStyle: CSSProperties = {
  ...statusBannerStyle,
  background: '#fff0f0',
  border: '1px solid #f3b3b3',
  color: '#a13838'
};

interface PurchaseFeedback {
  type: 'success' | 'error';
  message: string;
}

export const InventoryRestockModal = ({ isOpen, onClose, isWeekend }: InventoryRestockModalProps) => {
  const restockCostScalar = useConfigStore((state) => state.config.economy.restockCostScalar);
  const baseSellMarkup = useConfigStore((state) => state.config.economy.baseSellMarkup);
  const baseBuyMarkdown = useConfigStore((state) => state.config.economy.baseBuyMarkdown);
  const weightLimit = useInventoryStore((state) => state.weightLimit);
  const remainingCapacity = useInventoryStore((state) => state.remainingCapacity);
  const restockBatchSize = useInventoryStore((state) => state.restockBatchSize);
  const addItem = useInventoryStore((state) => state.addItem);
  const items = useInventoryStore((state) => state.items);

  const gold = useGlobalStatsStore((state) => state.stats.gold);
  const updateStats = useGlobalStatsStore((state) => state.updateStats);

  const [feedback, setFeedback] = useState<PurchaseFeedback | null>(null);

  const offers = useMemo(() => {
    const templates = listItemTemplates().filter((template) => template.visibility === 'common');
    return templates.slice(0, restockBatchSize);
  }, [restockBatchSize]);

  const offerPriceContexts = useMemo(() => {
    return offers.map((template) => ({
      template,
      priceContext: calculatePriceContext({
        basePrice: template.basePrice,
        transaction: 'restock',
        economy: {
          restockCostScalar,
          baseSellMarkup,
          baseBuyMarkdown
        }
      })
    }));
  }, [offers, restockCostScalar, baseSellMarkup, baseBuyMarkdown]);

  const resetFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const closeModal = useCallback(() => {
    resetFeedback();
    onClose();
  }, [onClose, resetFeedback]);

  const handlePurchase = useCallback(
    (template: ItemTemplate, priceContext: PriceCalculationResult) => {
      resetFeedback();

      if (!isWeekend) {
        setFeedback({ type: 'error', message: 'Restocking is only permitted during the weekend phase.' });
        return;
      }

      const currentGold = useGlobalStatsStore.getState().stats.gold;

      const transaction = applyTransaction({ gold: currentGold, price: priceContext });

      if (!transaction.success) {
        setFeedback({ type: 'error', message: 'Insufficient gold for this purchase.' });
        return;
      }

      const result = addItem(template, {
        source: 'restock',
        metadata: {
          price: priceContext.resultingPrice,
          priceContext
        }
      });

      if (!result.success) {
        const reason = result.reason === 'capacityExceeded' ? 'Not enough capacity for this item.' : 'Unable to add item.';
        setFeedback({ type: 'error', message: reason });
        return;
      }

      updateStats({ gold: transaction.goldAfter });
      setFeedback({
        type: 'success',
        message: `Purchased ${template.name} for ${priceContext.resultingPrice}g.`
      });
    },
    [addItem, isWeekend, resetFeedback, updateStats]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <header style={modalHeaderStyle}>
          <div>
            <h2 style={{ margin: 0 }}>Weekend Restock</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#636363' }}>
              Gold: <strong>{gold.toFixed(0)}g</strong> · Capacity: <strong>{remainingCapacity.toFixed(1)}kg</strong> /{' '}
              {weightLimit.toFixed(1)}kg · Inventory: {items.length} items · Offers: {offers.length}/{restockBatchSize}
            </p>
          </div>
          <button onClick={closeModal} style={closeButtonStyle} type="button" aria-label="Close restock modal">
            ×
          </button>
        </header>

        <div style={contentStyle}>
          {!isWeekend && (
            <div style={errorBannerStyle}>
              Restock purchases can only be completed once the week reaches the weekend phase.
            </div>
          )}

          {feedback && (
            <div style={feedback.type === 'success' ? successBannerStyle : errorBannerStyle}>{feedback.message}</div>
          )}

          <section style={offersGridStyle}>
            {offers.length === 0 && (
              <div style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px dashed #b7c4d6', color: '#5b6a88', background: '#f4f7fb', fontSize: '0.85rem' }}>
                No restock offers are available in the current catalog slice. Adjust `inventory.restockBatchSize` or add more
                templates to surface options.
              </div>
            )}

            {offerPriceContexts.map(({ template: offer, priceContext }) => {
              const fitsCapacity = offer.weight <= remainingCapacity;
              const affordability = applyTransaction({ gold, price: priceContext });
              const canAfford = affordability.success;
              const isDisabled = !isWeekend || !fitsCapacity || !canAfford;

              return (
                <article key={offer.id} style={offerCardStyle}>
                  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{offer.name}</h3>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#666' }}>
                        {offer.category.toUpperCase()} · {offer.quality.toUpperCase()} · {offer.scarcity.toUpperCase()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>{priceContext.resultingPrice}g</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>{offer.weight.toFixed(1)}kg</div>
                    </div>
                  </header>

                  {offer.lore && (
                    <p style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: '#4d4d4d' }}>{offer.lore}</p>
                  )}

                  <footer style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#777' }}>
                      {fitsCapacity ? 'Fits current capacity.' : 'Exceeds remaining capacity.'}
                    </div>
                    <button
                      onClick={() => handlePurchase(offer, priceContext)}
                      style={isDisabled ? disabledPurchaseButtonStyle : purchaseButtonStyle}
                      type="button"
                      disabled={isDisabled}
                    >
                      Purchase
                    </button>
                  </footer>
                </article>
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
};
