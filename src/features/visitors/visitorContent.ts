import type { VisitorConfig } from '#config/configTypes';
import type { VisitorHonesty, VisitorInstance, VisitorTemplate } from './types';

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `visitor-${Math.random().toString(36).slice(2)}`;
};

const sereneEnvoyTemplate: VisitorTemplate = {
  id: 'phase3-serene-envoy',
  persona: {
    codename: 'Serene Envoy',
    formalName: 'Mira of the Emberway',
    appearance: 'A courier draped in ember-stitched robes, carrying a satchel of sealed letters.',
    demeanor: 'Measured and observant, weighing every word before she speaks.',
    greeting: '“Peace upon your counter. I bring quiet tidings and hope to leave with a calming charm.”'
  },
  need: {
    kind: 'buy',
    summary: 'Seeks a keepsake that projects calm before a tense mediation.',
    itemHint: 'Small trinket or charm tagged as serene, diplomatic, or calming.',
    fairPriceMultiplier: 1
  },
  scripts: [
    {
      honesty: 'honest',
      lines: [
        '“Guild mediators travel light; the fewer tells we show, the safer our clients.”',
        '“Rumor says your wares earn smiles even from rivals. I would test that hope tonight.”'
      ]
    },
    {
      honesty: 'deceptive',
      lines: [
        '“Word on the road paints you charitable. Surely you offer gifts to weary couriers?”',
        '“A token for goodwill, nothing more. No need to check the seals or ask who I serve.”'
      ]
    }
  ]
};

const resolveDialogue = (template: VisitorTemplate, honesty: VisitorHonesty): readonly string[] => {
  const match = template.scripts.find((script) => script.honesty === honesty);
  if (match) {
    return match.lines;
  }
  return template.scripts[0]?.lines ?? [];
};

export const phaseThreeVisitorTemplate = sereneEnvoyTemplate;

export const createPhaseThreeVisitor = (config: VisitorConfig, tick: number, honesty: VisitorHonesty = 'honest'): VisitorInstance => {
  const dialogueLines = resolveDialogue(phaseThreeVisitorTemplate, honesty);
  return {
    id: generateId(),
    templateId: phaseThreeVisitorTemplate.id,
    honesty,
    persona: phaseThreeVisitorTemplate.persona,
    need: phaseThreeVisitorTemplate.need,
    satisfaction: config.baseSatisfaction,
    patience: config.basePatienceTicks,
    dialogueLines,
    talkCursor: 0,
    arrivalTick: tick,
    lastInteractionTick: tick,
    log: []
  };
};
