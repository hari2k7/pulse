import type { ApiErrorKind } from './types';

export type SimMode =
  | 'timeout'
  | '500'
  | 'empty'
  | 'badjson'
  | '404'
  | '429'
  | '503-with-retry-after'
  | 'slow'
  | 'partial'
  | 'html'
  | 'offline';

export class SimulatedApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(message: string, kind: ApiErrorKind, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    Object.setPrototypeOf(this, SimulatedApiError.prototype);
  }
}

export function getSimMode(): SimMode | null {
  if (!import.meta.env?.DEV) {
    return null;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const param = new URLSearchParams(window.location.search).get('sim');
  if (!param) return null;

  const validModes: SimMode[] = [
    'timeout',
    '500',
    'empty',
    'badjson',
    '404',
    '429',
    '503-with-retry-after',
    'slow',
    'partial',
    'html',
    'offline',
  ];

  if (validModes.includes(param as SimMode)) {
    return param as SimMode;
  }

  return null;
}

export async function checkDevSimulation(url: string): Promise<Response | null> {
  if (!import.meta.env?.DEV) {
    return null;
  }

  const mode = getSimMode();
  if (!mode) {
    return null;
  }

  // Small base delay so loading states and retries can be visually observed
  if (mode !== 'slow') {
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
  }

  switch (mode) {
    case 'timeout':
      throw new SimulatedApiError('Simulated request timeout after 8000ms (?sim=timeout)', 'timeout');

    case 'offline':
      throw new SimulatedApiError('Simulated network offline mode (?sim=offline)', 'offline');

    case '429':
      return new Response(
        JSON.stringify({ error: 'rate_limited', message: 'Too Many Requests (?sim=429)' }),
        {
          status: 429,
          statusText: 'Too Many Requests',
          headers: { 'Content-Type': 'application/json' },
        }
      );

    case '503-with-retry-after':
      return new Response(
        JSON.stringify({
          error: 'service_unavailable',
          message: 'Service Temporarily Unavailable (?sim=503-with-retry-after)',
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '2',
          },
        }
      );

    case 'slow': {
      // 5-second simulated latency per Task 3
      await new Promise<void>((resolve) => setTimeout(resolve, 5000));
      const isDetail = url.includes('/events/') && !url.endsWith('/events');
      const body = isDetail
        ? JSON.stringify({
            event: {
              id: 'b6e82a0b-d249-43c7-9bf4-e7cb3593361e',
              name: 'Slow Motion Dimensional Portal',
              category: 'Quantum Mechanics',
              blurb: 'Simulated 5s slow load test across temporal coordinates',
              event_status: 'ACTIVE',
              price: 0,
              is_per_head: true,
              total_seats: 50,
              seats_filled: 10,
              registration_status: 'OPEN',
              schedule_summary: { start_date: '2026-11-13', start_time: '10:00' },
            },
          })
        : JSON.stringify({
            events: [
              {
                id: 'b6e82a0b-d249-43c7-9bf4-e7cb3593361e',
                name: 'Slow Motion Dimensional Portal',
                category: 'Quantum Mechanics',
                blurb: 'Simulated 5s slow load test across temporal coordinates',
                event_status: 'ACTIVE',
                price: 0,
                is_per_head: true,
                total_seats: 50,
                seats_filled: 10,
                registration_status: 'OPEN',
                schedule_summary: { start_date: '2026-11-13', start_time: '10:00' },
              },
            ],
          });
      return new Response(body, {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });
    }

    case 'partial': {
      // Some malformed items mixed with valid items per Task 3 tolerant validation
      const isDetail = url.includes('/events/') && !url.endsWith('/events');
      const body = isDetail
        ? JSON.stringify({
            event: {
              id: 'b6e82a0b-d249-43c7-9bf4-e7cb3593361e',
              name: 'Valid Multiverse Hackathon',
              category: 'Hackathons',
              event_status: 'ACTIVE',
              price: 0,
              is_per_head: true,
            },
          })
        : JSON.stringify({
            events: [
              {
                id: 'b6e82a0b-d249-43c7-9bf4-e7cb3593361e',
                name: 'Valid Multiverse Hackathon',
                category: 'Hackathons',
                blurb: 'A valid event preserved during tolerant parsing',
                event_status: 'ACTIVE',
                price: 0,
                is_per_head: true,
                total_seats: 100,
                seats_filled: 20,
                registration_status: 'OPEN',
                schedule_summary: { start_date: '2026-11-13', start_time: '10:00' },
              },
              // Malformed items to test tolerant dropping:
              { id: '', name: 'Empty ID' },
              { name: 'Missing ID completely' },
              { id: '123' }, // Missing name
              null,
              'not-an-object',
              { id: 9999, name: 'Numeric ID' },
              {
                id: 'c7f93b1c-e350-44d8-ac05-f8dc4604472f',
                name: 'Second Valid Event (Chrono Coding)',
                category: 'Competitive Programming',
                blurb: 'Another valid event surviving validation',
                event_status: 'ACTIVE',
                price: 150,
                is_per_head: true,
                total_seats: 50,
                seats_filled: 45,
                registration_status: 'OPEN',
                schedule_summary: { start_date: '2026-11-14', start_time: '14:00' },
              },
            ],
          });
      return new Response(body, {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });
    }

    case 'html':
      return new Response(
        '<!DOCTYPE html><html><head><title>502 Bad Gateway</title></head><body><h1>502 Bad Gateway</h1><p>Edge server returned HTML instead of JSON.</p></body></html>',
        {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );

    case '500':
      return new Response(
        JSON.stringify({ error: 'internal_error', message: 'Simulated 500 Internal Server Error' }),
        {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'application/json' },
        }
      );

    case '404':
      return new Response(
        JSON.stringify({ error: 'not_found', message: 'Event not found.' }),
        {
          status: 404,
          statusText: 'Not Found',
          headers: { 'Content-Type': 'application/json' },
        }
      );

    case 'badjson':
      return new Response(
        '<!DOCTYPE html><html><body>502 Bad Gateway - malformed JSON response</body></html>',
        {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
        }
      );

    case 'empty': {
      const isDetail = url.includes('/events/') && !url.endsWith('/events');
      const body = isDetail
        ? JSON.stringify({ event: null })
        : JSON.stringify({ events: [] });
      return new Response(body, {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });
    }

    default:
      return null;
  }
}
