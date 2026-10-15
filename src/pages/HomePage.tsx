import { useMemo, type FC } from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvents } from '../hooks/useEvents';
import { queryClient } from '../lib/queryClient';
import { MultiverseHero } from '../components/strange/MultiverseHero';
import { EyeOfAgamotto } from '../components/strange/EyeOfAgamotto';
import { StatsSection } from '../components/strange/StatsSection';
import { FeaturedMultiverse } from '../components/strange/FeaturedMultiverse';
import { SponsorMarquee } from '../components/strange/SponsorMarquee';
import { SanctumAbout } from '../components/strange/SanctumAbout';
import { CloakSilhouette } from '../components/strange/CloakSilhouette';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { Button } from '../components/ui/Button';
import type { EventDetail } from '../lib/types';

export const HomePage: FC = () => {
  useDocumentMeta({
    title: 'STRANGE — A Tech Fest Beyond Reality',
    description:
      'A Tech Fest Beyond Reality. Step through the Sling Ring into alternate dimensions of code, engineering, and innovation.',
  });

  const { status, events, error, retry } = useEvents();


  // Earliest upcoming ACTIVE event date for Agamotto countdown fallback per Constraint 4
  const earliestActiveDate = useMemo(() => {
    const activeEvents = events.filter(
      (e) => e.event_status === 'ACTIVE' && e.schedule_summary?.start_date
    );
    if (activeEvents.length === 0) return undefined;

    const sorted = [...activeEvents].sort((a, b) => {
      const aDate = `${a.schedule_summary?.start_date}T${a.schedule_summary?.start_time || '00:00'}:00+05:30`;
      const bDate = `${b.schedule_summary?.start_date}T${b.schedule_summary?.start_time || '00:00'}:00+05:30`;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });

    const first = sorted[0]?.schedule_summary;
    if (!first?.start_date) return undefined;
    return `${first.start_date}T${first.start_time || '09:00'}:00+05:30`;
  }, [events]);

  // Prize pool sum calculated strictly from events whose detail data is loaded in TanStack Query cache per Constraint 3
  const totalPrizePool = useMemo(() => {
    try {
      const queryCache = queryClient.getQueryCache();
      const eventQueries = queryCache.findAll({ queryKey: ['event'] });
      let sum = 0;
      let count = 0;

      for (const q of eventQueries) {
        const data = q.state.data as EventDetail | undefined;
        if (data?.prizes && Array.isArray(data.prizes)) {
          for (const p of data.prizes) {
            if (typeof p.amount === 'number' && p.amount > 0) {
              sum += p.amount;
              count++;
            }
          }
        }
      }

      return count > 0 ? sum : null;
    } catch {
      return null;
    }
  }, []);

  // Loading skeleton state
  if (status === 'loading') {
    return <HomeLoadingSkeleton />;
  }

  // Error state with retry
  if (status === 'error') {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh] flex items-center justify-center">
        <ErrorState
          title="Multiverse Portal Disrupted"
          message={error?.message || 'Unable to establish temporal connection to the event servers.'}
          errorKind={error?.kind}
          onRetry={retry}
        />
      </div>
    );
  }

  // Empty state
  if (status === 'success' && events.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh] flex items-center justify-center">
        <EmptyState
          title="No Dimensional Events Materialized"
          description="There are currently no events registered across these coordinates."
          action={
            <Button variant="secondary" size="sm" onClick={retry}>
              Recalibrate Portal
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-[#07060D] text-[#F3EFE8] overflow-x-clip">
      {/* 1. Multiverse Hero with Sling Ring Portal & Real H1 Text */}
      <MultiverseHero />

      {/* 2. Temporal Convergence: Eye of Agamotto Countdown */}
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 bg-[#07060D] flex justify-center -mt-8 z-20">
        <div className="w-full max-w-xl">
          <EyeOfAgamotto fallbackDate={earliestActiveDate} />
        </div>
      </section>

      {/* 3. Festival Animated Counters */}
      <StatsSection events={events} totalPrizePool={totalPrizePool} />

      {/* 4. Cloak of Levitation Sweeping Section Divider */}
      <CloakSilhouette variant="divider" />

      {/* 5. Featured Multiverse Events (Asymmetric Layout) */}
      <FeaturedMultiverse events={events} />

      {/* 6. Multiverse Partner Marquee (Rendered only if festival.ts sponsors exist) */}
      <SponsorMarquee />

      {/* 7. Sanctum Sanctorum About Narrative */}
      <SanctumAbout />
    </div>
  );
};

/**
 * Dedicated Loading Skeleton for STRANGE Home
 */
const HomeLoadingSkeleton: FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#07060D] flex flex-col items-center justify-center py-24 px-4 space-y-8 animate-pulse select-none">
      <div className="w-32 h-6 rounded-full bg-[#1A1030]/60" />
      <div className="w-72 sm:w-96 h-16 sm:h-20 rounded-md bg-[#1A1030]/80" />
      <div className="w-64 sm:w-80 h-6 rounded bg-[#1A1030]/50" />
      <div className="w-64 h-64 rounded-full border-4 border-[#FF7A1A]/20" />
      <div className="flex gap-4 pt-4">
        <div className="w-36 h-12 rounded-md bg-[#FF7A1A]/30" />
        <div className="w-36 h-12 rounded-md bg-[#1A1030]/60" />
      </div>
    </div>
  );
};
