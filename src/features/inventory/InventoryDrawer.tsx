import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { listItemTemplates } from '@/data/items';
import type { ItemTagKey } from '@/data/items';
import { useInventoryStore } from './inventoryStore';
import type { InventoryItem } from './inventoryTypes';

const drawerBaseStyle: CSSProperties = {
  position: 'fixed',
  top: '1rem',
  right: '1rem',
  height: 'calc(100vh - 2rem)',
  width: '320px',
  background: '#fdfdfd',
  border: '1px solid #d0d0d0',
  borderRadius: '0.75rem',
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.12)',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  zIndex: 12
};

const toggleStyle: CSSProperties = {
  position: 'absolute',
  left: '-48px',
  top: '1rem',
  width: '48px',
  height: '48px',
  borderRadius: '0.75rem 0 0 0.75rem',
  border: '1px solid #d0d0d0',
  borderRight: 'none',
  background: '#4a90e2',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600
};

const panelHeaderStyle: CSSProperties = {
  padding: '1rem 1.25rem',
  borderBottom: '1px solid #e5e5e5',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '0.5rem'
};

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  borderRadius: '999px',
  padding: '0.15rem 0.6rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase'
};

const inventoryListStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '1rem 1.25rem',
  display: 'grid',
  gap: '0.75rem'
};

const inventoryCardStyle: CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: '0.65rem',
  padding: '0.9rem',
  background: '#fff',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.06)'
};

const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '0.5rem'
};

const tagListStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.35rem',
  marginTop: '0.75rem'
};

const buttonStyle: CSSProperties = {
  padding: '0.4rem 0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #c0c0c0',
  background: '#fff',
  cursor: 'pointer'
};

const smallButtonStyle: CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '0.35rem',
  border: '1px solid #bbb',
  background: '#f5f5f5',
  fontSize: '0.75rem',
  cursor: 'pointer'
};

const hiddenTagStyle: CSSProperties = {
  ...badgeStyle,
  background: '#fff0cc',
  color: '#8a5802',
  border: '1px solid #f1d48b'
};

const revealedTagStyle: CSSProperties = {
  ...badgeStyle,
  background: '#e8f6ff',
  color: '#1b5fa1',
  border: '1px solid #a5d4ff'
};

const summarizeTags = (item: InventoryItem) => {
  const revealed = item.tags.filter((tag) => tag.visibility === 'revealed');
  const hidden = item.tags.filter((tag) => tag.visibility === 'hidden');
  return { revealed, hidden };
};

export const InventoryDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const items = useInventoryStore((state) => state.items);
  const totalWeight = useInventoryStore((state) => state.totalWeight);
  const weightLimit = useInventoryStore((state) => state.weightLimit);
  const remainingCapacity = useInventoryStore((state) => state.remainingCapacity);
  const restock = useInventoryStore((state) => state.restock);
  const removeItem = useInventoryStore((state) => state.removeItem);
  const revealTag = useInventoryStore((state) => state.revealTag);
  const restockBatchSize = useInventoryStore((state) => state.restockBatchSize);

  const sortedItems = useMemo(() => [...items].sort((a, b) => b.addedAt - a.addedAt), [items]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleRestock = useCallback(() => {
    const templates = [...listItemTemplates()].sort(() => Math.random() - 0.5);
    restock({ templates });
  }, [restock]);

  const handleConsume = useCallback(
    (instanceId: string) => {
      removeItem(instanceId, { source: 'consume', reason: 'consume' });
    },
    [removeItem]
  );

  const handleReveal = useCallback(
    (itemId: string, tagKey: ItemTagKey) => {
      revealTag(itemId, tagKey, 'appraisal');
    },
    [revealTag]
  );

  const drawerStyle: CSSProperties = {
    ...drawerBaseStyle,
    transform: isOpen ? 'translateX(0)' : 'translateX(calc(100% - 48px))',
    boxShadow: isOpen ? drawerBaseStyle.boxShadow : '0 0 0 rgba(0,0,0,0)'
  };

  return (
    <aside style={drawerStyle}>
      <button onClick={handleToggle} style={toggleStyle} type="button">
        {isOpen ? '→' : '←'}
      </button>

      {isOpen && (
        <>
          <header style={panelHeaderStyle}>
            <div>
              <h2 style={{ margin: 0 }}>Inventory</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                {sortedItems.length} items · {totalWeight.toFixed(1)}kg / {weightLimit.toFixed(1)}kg
              </p>
            </div>
            <button onClick={handleRestock} style={buttonStyle} type="button">
              Restock {restockBatchSize}
            </button>
          </header>

          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Remaining Capacity</span>
              <strong>{remainingCapacity.toFixed(1)}kg</strong>
            </div>
          </div>

          <div style={inventoryListStyle}>
            {sortedItems.length === 0 && (
              <div style={{ textAlign: 'center', color: '#777', fontSize: '0.9rem' }}>
                Inventory is empty. Use Restock to add items.
              </div>
            )}

            {sortedItems.map((item) => {
              const { revealed, hidden } = summarizeTags(item);
              return (
                <article key={item.instanceId} style={inventoryCardStyle}>
                  <div style={cardHeaderStyle}>
                    <div>
                      <h3 style={{ margin: 0 }}>{item.template.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                        {item.template.category.toUpperCase()} · {item.template.quality.toUpperCase()} ·{' '}
                        {item.template.scarcity.toUpperCase()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>{item.template.basePrice.toFixed(0)}g</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>{item.template.weight.toFixed(1)}kg</div>
                    </div>
                  </div>

                  {item.template.lore && (
                    <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#555' }}>{item.template.lore}</p>
                  )}

                  <div style={tagListStyle}>
                    {revealed.map((tag) => (
                      <span key={tag.key} style={revealedTagStyle}>
                        {tag.key}
                      </span>
                    ))}
                    {hidden.map((tag) => (
                      <span key={`hidden-${tag.key}`} style={hiddenTagStyle}>
                        ???
                        <button
                          onClick={() => handleReveal(item.instanceId, tag.key)}
                          style={{ ...smallButtonStyle, marginLeft: '0.35rem' }}
                          type="button"
                        >
                          Reveal
                        </button>
                      </span>
                    ))}
                    {revealed.length === 0 && hidden.length === 0 && (
                      <span style={{ ...badgeStyle, background: '#f1f1f1', color: '#555', border: '1px solid #ddd' }}>
                        No tags
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleConsume(item.instanceId)} style={smallButtonStyle} type="button">
                      Consume
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
};
