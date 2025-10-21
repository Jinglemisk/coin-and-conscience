import type { ItemTemplate, ItemTagDefinition } from './itemTypes';

const createTag = (
  key: ItemTagDefinition['key'],
  visibility: ItemTagDefinition['visibility'] = 'revealed',
  revealOn: ItemTagDefinition['revealOn'] = visibility === 'revealed' ? 'automatic' : 'appraisal'
): ItemTagDefinition => ({
  key,
  visibility,
  revealOn
});

const items: readonly ItemTemplate[] = Object.freeze([
  {
    id: 'weapon.longsword.temple',
    name: 'Templar Longsword',
    category: 'weapon',
    basePrice: 180,
    weight: 6.5,
    scarcity: 'uncommon',
    quality: 'fine',
    visibility: 'common',
    tags: [createTag('blessed')],
    lore: 'Issued to knightly orders sworn to protect the old kingdoms.'
  },
  {
    id: 'armor.cuirass.obsidian',
    name: 'Obsidian Cuirass',
    category: 'armor',
    basePrice: 420,
    weight: 500,
    scarcity: 'rare',
    quality: 'fine',
    visibility: 'common',
    tags: [createTag('cursed', 'hidden'), createTag('illegal', 'hidden', 'quest')],
    lore: 'Said to have been smuggled out of the catacombs beneath Nightfall Citadel.'
  },
  {
    id: 'potion.elixir.moonlit',
    name: 'Moonlit Clarity Elixir',
    category: 'potion',
    basePrice: 95,
    weight: 0.6,
    scarcity: 'uncommon',
    quality: 'standard',
    visibility: 'common',
    tags: [createTag('illegal', 'revealed')],
    lore: 'Favored by seers—even though possession is outlawed in most duchies.'
  },
  {
    id: 'book.codex.hidden-lineage',
    name: 'Codex of the Hidden Lineage',
    category: 'book',
    basePrice: 265,
    weight: 500,
    scarcity: 'rare',
    quality: 'fine',
    visibility: 'hidden',
    tags: [createTag('hiddenLineage', 'hidden', 'story'), createTag('quest', 'hidden', 'story')],
    lore: 'Contains genealogies erased from official archives; requested only in whispered meetings.'
  },
  {
    id: 'trinket.charm.riverstone',
    name: 'Riverstone Luck Charm',
    category: 'trinket',
    basePrice: 35,
    weight: 500,
    scarcity: 'common',
    quality: 'standard',
    visibility: 'common',
    tags: [],
    lore: 'Sold in markets along the Serene River to ward off misfortune.'
  },
  {
    id: 'clothing.cloak.twilight',
    name: 'Twilight Weaver Cloak',
    category: 'clothing',
    basePrice: 155,
    weight: 4.1,
    scarcity: 'uncommon',
    quality: 'fine',
    visibility: 'common',
    tags: [createTag('illegal', 'hidden'), createTag('unique', 'hidden', 'quest')],
    lore: 'Woven from stolen moonlight threads, rumored to let its wearer walk unseen.'
  }
]);

export const itemCatalog = items;

export const itemCatalogById = new Map(itemCatalog.map((item) => [item.id, item] as const));

export const listItemTemplates = () => itemCatalog;

export const getItemTemplateById = (id: string) => itemCatalogById.get(id);
