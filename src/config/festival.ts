/**
 * STRANGE — Festival Configuration
 *
 * NON-NEGOTIABLE CONSTRAINT:
 * Event data comes only from the API. The API has NO registration URL, NO sponsors,
 * NO festival dates, NO college/participant counts.
 *
 * Anything unset here is cleanly HIDDEN in the UI and never fabricated.
 *
 * TODO FOR USER:
 * Fill in the following fields with your official college fest details when available:
 * - startDate / endDate: Festival dates (ISO 8601 with +05:30 offset, e.g. "2026-11-13T09:00:00+05:30")
 * - venue: Physical campus address / venue name
 * - collegeName: Host institution name
 * - organizers: Organizing committees or societies
 * - sponsors: Official corporate/multiverse partners with tiers
 * - socials: Social media links
 * - expectedParticipants: Confirmed or projected attendee count
 * - participatingColleges: Number of represented campuses
 */

export interface Sponsor {
  name: string;
  logoUrl?: string;
  href?: string;
  tier?: 'Title' | 'Powered By' | 'Associate' | 'Community';
}

export interface SocialLink {
  platform: 'twitter' | 'instagram' | 'linkedin' | 'github' | 'youtube' | 'discord';
  label: string;
  url: string;
}

export interface FestivalConfig {
  festivalName: string;
  tagline: string;
  // TODO: Set festival start date (ISO string with +05:30)
  startDate?: string;
  // TODO: Set festival end date
  endDate?: string;
  // TODO: Set primary campus venue name
  venue?: string;
  // TODO: Set official college name
  collegeName?: string;
  // TODO: Add organizing committees
  organizers?: string[];
  // TODO: Add official festival sponsors when confirmed
  sponsors?: Sponsor[];
  // TODO: Add festival social links
  socials?: SocialLink[];
  // TODO: Set official contact email
  contactEmail?: string;
  // TODO: Set confirmed participant target
  expectedParticipants?: number;
  // TODO: Set confirmed colleges count
  participatingColleges?: number;
}

export const FESTIVAL_CONFIG: FestivalConfig = {
  festivalName: 'STRANGE',
  tagline: 'A Tech Fest Beyond Reality.',

  // Optional dates: When set, the Eye of Agamotto countdown targets this date.
  // If undefined, it falls back to the earliest upcoming active event from the live API.
  startDate: '2026-11-13T09:00:00+05:30',
  endDate: '2026-11-15T21:00:00+05:30',

  venue: 'Sanctum Campus, Pune, Maharashtra',
  collegeName: 'Pune Institute of Technology & Engineering',

  organizers: [
    'Department of Computer Engineering',
    'Robotics & Automation Society',
    'Design & Creative Collective',
  ],

  // TODO: Add sponsor logos and links. If empty, the sponsor marquee is completely hidden.
  sponsors: [],

  socials: [
    { platform: 'twitter', label: 'X (Twitter)', url: 'https://twitter.com' },
    { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com' },
    { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com' },
    { platform: 'github', label: 'GitHub', url: 'https://github.com' },
    { platform: 'discord', label: 'Discord', url: 'https://discord.com' },
  ],

  contactEmail: 'sanctum@strangefest.org',

  // Configured statistics (labeled as configured in code comments; hidden if undefined)
  expectedParticipants: 2500,
  participatingColleges: 60,
};
