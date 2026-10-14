import type { ApiErrorKind } from './types';

export type SimMode = 'timeout' | '500' | 'empty' | 'badjson' | '404';

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

  if (
    param === 'timeout' ||
    param === '500' ||
    param === 'empty' ||
    param === 'badjson' ||
    param === '404'
  ) {
    return param;
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

  // Small delay so loading states and retries can be visually observed
  await new Promise<void>((resolve) => setTimeout(resolve, 200));

  switch (mode) {
    case 'timeout':
      throw new SimulatedApiError('Simulated request timeout after 8000ms (?sim=timeout)', 'timeout');

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
