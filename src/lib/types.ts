export type EventType = 'EVENT' | 'WORKSHOP';
export type EventMode = 'OFFLINE' | 'ONLINE';
export type EventStatus = 'ACTIVE' | 'COMPLETED' | 'CLOSED';
export type RegistrationStatus = 'OPEN' | 'CLOSED' | 'SOLD_OUT';

export interface ScheduleSummary {
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
}

export interface EventSummary {
  id: string;
  name: string;
  blurb: string;
  cover_image_url: string;
  cover_image_alt: string;
  category: string;
  tags: string[];
  event_type: EventType;
  event_mode: EventMode;
  event_status: EventStatus;
  is_featured: boolean;
  is_technical: boolean;
  price: number;
  is_per_head: boolean;
  min_teamsize: number;
  max_teamsize: number;
  total_seats: number;
  seats_filled: number;
  registration_status: RegistrationStatus;
  registration_deadline: string;
  schedule_summary: ScheduleSummary;
}

export interface Schedule {
  event_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
}

export interface Prize {
  rank?: number;
  title?: string;
  amount?: number;
  description?: string;
}

export interface Faq {
  question?: string;
  answer?: string;
}

export interface Organizer {
  id?: string;
  name?: string;
  org_type?: string;
}

export interface Coordinator {
  id?: string;
  name?: string;
  role?: string;
  contact?: string;
}

export interface EventDetail extends EventSummary {
  description?: string;
  banner_image_url?: string;
  banner_image_alt?: string;
  gallery_images?: string[];
  highlights?: string[];
  what_to_expect?: string[];
  eligibility?: string[];
  prerequisites?: string[];
  rules?: string[];
  prizes?: Prize[];
  faqs?: Faq[];
  schedules?: Schedule[];
  organizers?: Organizer[];
  coordinators?: Coordinator[];
}

export interface EventsApiResponse {
  events: EventSummary[];
}

export interface EventDetailApiResponse {
  event: EventDetail;
}

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'notfound' | 'invalid';

export interface GetEventsResult {
  events: EventSummary[];
  stale: boolean;
  fetchedAt: number | null;
}

export interface GetEventsOptions {
  force?: boolean;
}

export type GetEventOptions = Record<string, never>;

