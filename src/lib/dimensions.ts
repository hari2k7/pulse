export type DimensionCategory = 'hackathon' | 'technical' | 'workshop' | 'non-technical';

export interface DimensionConfig {
  id: DimensionCategory;
  name: string;
  colorHex: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  glowShadow: string;
}

/**
 * Derives the multiverse dimension category from event metadata:
 * - Technical = blue (#3BA3FF)
 * - Hackathon = orange (#FF7A1A)
 * - Workshop = green (#3DDC97)
 * - Non-technical = violet (#A66BFF)
 * Gracefully handles unknown or missing fields.
 */
export function getEventDimension(event: {
  category?: string;
  event_type?: string;
  is_technical?: boolean;
}): DimensionConfig {
  const cat = (event.category || '').toLowerCase();
  const eventType = (event.event_type || '').toUpperCase();

  // 1. Hackathons map to Portal Orange
  if (cat.includes('hackathon') || cat.includes('code crucible') || cat.includes('sprint')) {
    return {
      id: 'hackathon',
      name: 'Hackathon Realm',
      colorHex: '#FF7A1A',
      borderColor: 'border-[#FF7A1A]',
      bgColor: 'bg-[#FF7A1A]/10',
      textColor: 'text-[#FF7A1A]',
      glowShadow: '0 0 20px rgba(255, 122, 26, 0.4)',
    };
  }

  // 2. Workshops map to Magic Green
  if (eventType === 'WORKSHOP' || cat.includes('workshop') || cat.includes('masterclass')) {
    return {
      id: 'workshop',
      name: 'Workshop Dimension',
      colorHex: '#3DDC97',
      borderColor: 'border-[#3DDC97]',
      bgColor: 'bg-[#3DDC97]/10',
      textColor: 'text-[#3DDC97]',
      glowShadow: '0 0 20px rgba(61, 220, 151, 0.4)',
    };
  }

  // 3. Technical events map to Electric Blue
  if (event.is_technical || cat.includes('tech') || cat.includes('ai') || cat.includes('robot') || cat.includes('cyber')) {
    return {
      id: 'technical',
      name: 'Technical Dimension',
      colorHex: '#3BA3FF',
      borderColor: 'border-[#3BA3FF]',
      bgColor: 'bg-[#3BA3FF]/10',
      textColor: 'text-[#3BA3FF]',
      glowShadow: '0 0 20px rgba(59, 163, 255, 0.4)',
    };
  }

  // 4. Non-technical / Creative / Cultural map to Mystic Violet
  return {
    id: 'non-technical',
    name: 'Mystic Realm',
    colorHex: '#A66BFF',
    borderColor: 'border-[#A66BFF]',
    bgColor: 'bg-[#A66BFF]/10',
    textColor: 'text-[#A66BFF]',
    glowShadow: '0 0 20px rgba(166, 107, 255, 0.4)',
  };
}
