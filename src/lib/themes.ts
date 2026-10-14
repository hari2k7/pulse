import type { EventSummary } from './types';

export type ThemeId =
  | 'Tech & Code'
  | 'Robotics & Engineering'
  | 'Design & Visual Arts'
  | 'Performing & Music'
  | 'Words & Culture'
  | 'Science & Startups'
  | 'More';

export const THEMES: readonly ThemeId[] = [
  'Tech & Code',
  'Robotics & Engineering',
  'Design & Visual Arts',
  'Performing & Music',
  'Words & Culture',
  'Science & Startups',
  'More',
] as const;

/**
 * Category-to-theme mapping derived from PROJECT.md Section 6 Real Data Facts
 */
export const CATEGORY_TO_THEME: Readonly<Record<string, ThemeId>> = {
  // Tech & Code
  Coding: 'Tech & Code',
  Hackathon: 'Tech & Code',
  'Artificial Intelligence': 'Tech & Code',
  'Web Development': 'Tech & Code',
  Cybersecurity: 'Tech & Code',
  Gaming: 'Tech & Code',

  // Robotics & Engineering
  Robotics: 'Robotics & Engineering',
  Engineering: 'Robotics & Engineering',
  'Aerial Robotics': 'Robotics & Engineering',
  'Robotics & Electronics': 'Robotics & Engineering',

  // Design & Visual Arts
  'Design & Product': 'Design & Visual Arts',
  'Visual Arts': 'Design & Visual Arts',
  'Art & Design': 'Design & Visual Arts',
  'Arts & Craft': 'Design & Visual Arts',
  Design: 'Design & Visual Arts',
  Photography: 'Design & Visual Arts',
  'Film & Media': 'Design & Visual Arts',

  // Performing & Music
  Dance: 'Performing & Music',
  Music: 'Performing & Music',
  Theatre: 'Performing & Music',

  // Words & Culture
  'Debate & Literary': 'Words & Culture',
  'Literary Arts': 'Words & Culture',
  'Quiz & Culture': 'Words & Culture',
  'Food & Culture': 'Words & Culture',

  // Science & Startups
  Sustainability: 'Science & Startups',
  Astronomy: 'Science & Startups',
  Entrepreneurship: 'Science & Startups',
};

/**
 * Subtitles for each theme row
 */
export const THEME_SUBTITLES: Readonly<Record<ThemeId, string>> = {
  'Tech & Code': 'Hackathons, generative AI, cybersecurity, and competitive coding.',
  'Robotics & Engineering': 'Autonomous robots, drone time-trials, structural bridges, and maker labs.',
  'Design & Visual Arts': 'Product design, photography, short films, live sketching, and ceramic craft.',
  'Performing & Music': 'Street dance clashes, battle of the bands, classical soloists, and improv.',
  'Words & Culture': 'Parliamentary debates, student slam poetry, street food cookoffs, and pop quizzes.',
  'Science & Startups': 'Campus venture pitching, guided stargazing, and circular repairs.',
  More: 'Explore unique campus gatherings and interdisciplinary sessions.',
};

/**
 * Maps a raw category name to its broader thematic group.
 * Unknown categories fall into "More".
 */
export function getThemeForCategory(category?: string | null): ThemeId {
  if (!category || typeof category !== 'string') return 'More';
  const trimmed = category.trim();
  return CATEGORY_TO_THEME[trimmed] ?? 'More';
}

/**
 * Returns whether an event is considered upcoming for landing page rows.
 * Per PROJECT.md: Exclude COMPLETED and CLOSED events from all landing rows.
 */
export function isUpcomingEvent(event?: Partial<EventSummary> | null): boolean {
  if (!event) return false;
  if (event.event_status === 'COMPLETED' || event.event_status === 'CLOSED') {
    return false;
  }
  if (event.registration_status === 'CLOSED') {
    return false;
  }
  return true;
}

/**
 * Filters and sorts events that are closing soon:
 * registration_status === 'OPEN' with a valid future registration deadline,
 * sorted nearest deadline first.
 */
export function getClosingSoonEvents(events: EventSummary[]): EventSummary[] {
  const now = Date.now();

  const openWithDeadlines = events
    .filter((event) => {
      if (event.registration_status !== 'OPEN') return false;
      if (!isUpcomingEvent(event)) return false;
      if (!event.registration_deadline) return false;
      const deadline = new Date(event.registration_deadline).getTime();
      return !isNaN(deadline);
    })
    .sort((a, b) => {
      const timeA = new Date(a.registration_deadline as string).getTime();
      const timeB = new Date(b.registration_deadline as string).getTime();
      return timeA - timeB;
    });

  const futureOnly = openWithDeadlines.filter((event) => {
    const deadline = new Date(event.registration_deadline as string).getTime();
    return deadline > now;
  });

  return futureOnly.length >= 3 ? futureOnly : openWithDeadlines;
}

/**
 * Groups upcoming events by theme.
 */
export function groupUpcomingEventsByTheme(
  events: EventSummary[]
): Record<ThemeId, EventSummary[]> {
  const result: Record<ThemeId, EventSummary[]> = {
    'Tech & Code': [],
    'Robotics & Engineering': [],
    'Design & Visual Arts': [],
    'Performing & Music': [],
    'Words & Culture': [],
    'Science & Startups': [],
    More: [],
  };

  for (const event of events) {
    if (!isUpcomingEvent(event)) continue;
    const theme = getThemeForCategory(event.category);
    result[theme].push(event);
  }

  return result;
}
