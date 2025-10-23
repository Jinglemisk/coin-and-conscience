export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'clothing'
  | 'book'
  | 'potion'
  | 'trinket';

export type ItemScarcity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type ItemQuality = 'poor' | 'standard' | 'fine' | 'masterwork';

export type ItemTagKey =
  | 'illegal'
  | 'cursed'
  | 'blessed'
  | 'quest'
  | 'unique'
  | 'hiddenLineage';

export type ItemTagVisibility = 'revealed' | 'hidden';

export type ItemTagReveal = 'automatic' | 'appraisal' | 'quest' | 'story';

export interface ItemTagDefinition {
  key: ItemTagKey;
  visibility: ItemTagVisibility;
  /** Optional signal for UI or actions about how this tag becomes visible. */
  revealOn?: ItemTagReveal;
}

export type ItemVisibility = 'common' | 'hidden';

export interface ItemTemplate {
  id: string;
  name: string;
  category: ItemCategory;
  basePrice: number;
  weight: number;
  scarcity: ItemScarcity;
  quality: ItemQuality;
  visibility: ItemVisibility;
  tags: readonly ItemTagDefinition[];
  /** Optional flavor text or notes for future UI work. */
  lore?: string;
}
