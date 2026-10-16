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
  // TODO: Set general registration URL if available
  registrationUrl?: string;
}

export const FESTIVAL_CONFIG: FestivalConfig = {
  festivalName: 'STRANGE',
  tagline: 'A Tech Fest Beyond Reality.',

  // TODO: Set festival start & end dates (ISO 8601 with +05:30 offset, e.g. "2026-11-13T09:00:00+05:30")
  // When unset, the countdown automatically falls back to the earliest upcoming active event from the API.
  startDate: undefined,
  endDate: undefined,

  // TODO: Set physical campus venue name when announced (e.g. "Main Campus Auditorium")
  // Unset = completely hidden across the site. Never faked.
  venue: undefined,

  // TODO: Set official organizing college or university name
  // Unset = completely hidden.
  collegeName: undefined,

  // TODO: Add organizing committees or student societies
  organizers: undefined,

  // TODO: Add official festival sponsors when confirmed.
  // Unset / empty = sponsor section is completely hidden.
  sponsors: [],

  // TODO: Add official festival social media channels
  // Unset / empty = social links section hidden.
  socials: [],

  // TODO: Set official contact / inquiries email address
  // Unset = contact email block is hidden.
  contactEmail: undefined,

  // TODO: Set participant and college count benchmarks when verified
  // Unset = counters remain hidden.
  expectedParticipants: undefined,
  participatingColleges: undefined,

  // TODO: To enable registration, set your registration URL here (e.g. 'https://example.com/register'). When set, Register buttons will link out.
  registrationUrl: undefined,
};
