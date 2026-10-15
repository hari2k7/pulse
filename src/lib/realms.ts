import type { EventSummary } from './types';

export type RealmId = 'creation' | 'challenge' | 'tech' | 'unbound';

export const REALM_IDS: readonly RealmId[] = [
  'creation',
  'challenge',
  'tech',
  'unbound',
] as const;

export interface RealmDefinition {
  id: RealmId;
  name: string;
  descriptor: string;
  accentColor: string;
  bgTint: string;
  borderGlow: string;
  count: number;
  categories: string[];
}

export interface RealmMeta {
  id: RealmId;
  name: string;
  defaultDescriptor: string;
  accentColor: string;
  bgTint: string;
  borderGlow: string;
}

export const REALM_META: Record<RealmId, RealmMeta> = {
  creation: {
    id: 'creation',
    name: 'Creation Realm',
    defaultDescriptor: 'Labs, Studios & Hands-on Building',
    accentColor: '#3DDC97', // Emerald Green
    bgTint: 'rgba(61, 220, 151, 0.12)',
    borderGlow: 'rgba(61, 220, 151, 0.35)',
  },
  challenge: {
    id: 'challenge',
    name: 'Challenge Realm',
    defaultDescriptor: 'Code, Hackathons & Esports',
    accentColor: '#FF7A1A', // Portal Orange
    bgTint: 'rgba(255, 122, 26, 0.12)',
    borderGlow: 'rgba(255, 122, 26, 0.35)',
  },
  tech: {
    id: 'tech',
    name: 'Tech Realm',
    defaultDescriptor: 'AI, Robotics, Security & Aero',
    accentColor: '#3BA3FF', // Electric Blue
    bgTint: 'rgba(59, 163, 255, 0.12)',
    borderGlow: 'rgba(59, 163, 255, 0.35)',
  },
  unbound: {
    id: 'unbound',
    name: 'Unbound Realm',
    defaultDescriptor: 'Arts, Media, Music & Culture',
    accentColor: '#A66BFF', // Amethyst Violet
    bgTint: 'rgba(166, 107, 255, 0.12)',
    borderGlow: 'rgba(166, 107, 255, 0.35)',
  },
};

/**
 * Normalized list of known hackathon/competition category patterns.
 * Unknown categories fall back to is_technical check.
 */
const CHALLENGE_CATEGORIES = new Set([
  'hackathon',
  'coding',
  'gaming',
  'coding contest',
  'capture the flag',
  'robotics combat',
  'design sprint',
  'esports',
  'competitive programming',
]);

export function isChallengeCategory(category?: string | null): boolean {
  if (!category || typeof category !== 'string') return false;
  const normalized = category.trim().toLowerCase();
  if (CHALLENGE_CATEGORIES.has(normalized)) return true;
  return /hackathon|contest|competition|challenge|gaming|sprint|combat|ctf/i.test(normalized);
}

/**
 * Derives the Realm ID for an event strictly by prompt precedence:
 * 1) event_type WORKSHOP -> Creation Realm (green)
 * 2) hackathon/competition categories -> Challenge Realm (orange)
 * 3) remaining is_technical -> Tech Realm (blue)
 * 4) remaining -> Unbound Realm (violet)
 */
export function realmIdOf(event?: Partial<EventSummary> | null): RealmId {
  if (!event) return 'unbound';

  // 1) WORKSHOP -> Creation Realm
  if (event.event_type === 'WORKSHOP') {
    return 'creation';
  }

  // 2) Hackathon / competition-type categories -> Challenge Realm
  if (isChallengeCategory(event.category)) {
    return 'challenge';
  }

  // 3) Remaining is_technical -> Tech Realm
  if (event.is_technical === true) {
    return 'tech';
  }

  // 4) Remaining -> Unbound Realm
  return 'unbound';
}

/**
 * Returns a static or default RealmDefinition for a single event
 */
export function realmOf(event?: Partial<EventSummary> | null): RealmDefinition {
  const rId = realmIdOf(event);
  const meta = REALM_META[rId];
  return {
    ...meta,
    descriptor: meta.defaultDescriptor,
    count: 1,
    categories: event?.category ? [event.category] : [],
  };
}

export function isRealmId(val: unknown): val is RealmId {
  return typeof val === 'string' && (REALM_IDS as readonly string[]).includes(val);
}

/**
 * Category label cleaner/shortener for descriptor generation
 */
function cleanCategoryName(cat: string): string {
  const map: Record<string, string> = {
    'Artificial Intelligence': 'AI',
    'Robotics & Electronics': 'Electronics',
    'Design & Product': 'Product',
    'Visual Arts': 'Visual Arts',
    'Arts & Craft': 'Craft',
    'Film & Media': 'Media',
    'Debate & Literary': 'Debate',
    'Aerial Robotics': 'Aero',
    'Web Development': 'Web',
    'Quiz & Culture': 'Quiz',
    'Food & Culture': 'Culture',
    'Literary Arts': 'Lit',
    'Art & Design': 'Art',
  };
  return map[cat] || cat;
}

/**
 * Derives the dynamic descriptor line from the real categories present in that realm
 */
function buildDescriptor(meta: RealmMeta, categories: string[]): string {
  if (categories.length === 0) return meta.defaultDescriptor;
  const cleaned = Array.from(new Set(categories.map(cleanCategoryName)));
  // Pick up to 4 representative categories
  const slice = cleaned.slice(0, 4);
  return slice.join(', ');
}

/**
 * Derive full realm definitions from live events data.
 * Counts sum to total events. Realms with 0 events are hidden.
 */
export function getRealms(events: EventSummary[]): RealmDefinition[] {
  const tally: Record<RealmId, { count: number; categories: Set<string> }> = {
    creation: { count: 0, categories: new Set() },
    challenge: { count: 0, categories: new Set() },
    tech: { count: 0, categories: new Set() },
    unbound: { count: 0, categories: new Set() },
  };

  for (const event of events) {
    const rId = realmIdOf(event);
    tally[rId].count += 1;
    if (event.category) {
      tally[rId].categories.add(event.category);
    }
  }

  const result: RealmDefinition[] = [];

  for (const id of REALM_IDS) {
    const meta = REALM_META[id];
    const data = tally[id];

    // Hide realms with 0 events
    if (data.count === 0) continue;

    const catArray = Array.from(data.categories);
    result.push({
      id,
      name: meta.name,
      descriptor: buildDescriptor(meta, catArray),
      accentColor: meta.accentColor,
      bgTint: meta.bgTint,
      borderGlow: meta.borderGlow,
      count: data.count,
      categories: catArray,
    });
  }

  return result;
}

export function getRealmMetadata(id: RealmId): RealmMeta {
  return REALM_META[id] || REALM_META.unbound;
}
