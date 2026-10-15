import { useMemo, type FC } from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvents } from '../hooks/useEvents';
import { MultiverseHero } from '../components/strange/MultiverseHero';
import { ChamberPreview } from '../components/strange/ChamberPreview';
import { FeaturedMultiverse } from '../components/strange/FeaturedMultiverse';
import { EyeOfAgamotto } from '../components/strange/EyeOfAgamotto';
import { SanctumAbout } from '../components/strange/SanctumAbout';
import { SponsorMarquee } from '../components/strange/SponsorMarquee';
import { FinalGateway } from '../components/strange/FinalGateway';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { Button } from '../components/ui/Button';
import { SectionErrorBoundary } from '../components/common/SectionErrorBoundary';

export const HomePage: FC = () => {
  useDocumentMeta({
    title: 'STRANGE — A Tech Fest Beyond Reality',
    description:
      'A Tech Fest Beyond Reality. Step through the Sling Ring into alternate dimensions of code, engineering, and innovation.',
  });

  const { status, events, error, retry } = useEvents();

  // Earliest upcoming ACTIVE event date for Agamotto countdown fallback
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
      {/* Scene 1 & 2: Multiverse Hero with Dominant Sling Ring Portal & Scroll Scrub */}
      <MultiverseHero />

      {/* Scene 3: Multiverse Chamber Preview (4 Realm Portals) */}
      <SectionErrorBoundary sectionName="chamber-preview">
        <div className="content-visibility-auto">
          <ChamberPreview events={events} />
        </div>
      </SectionErrorBoundary>

      {/* Scene 4: Featured Artifacts of this Reality (Max 6 Cards) */}
      <SectionErrorBoundary sectionName="featured-artifacts">
        <div className="content-visibility-auto-lg">
          <FeaturedMultiverse events={events} />
        </div>
      </SectionErrorBoundary>

      {/* Scene 5: Time is Converging (Eye of Agamotto Countdown) */}
      <SectionErrorBoundary sectionName="countdown">
        <section className="relative w-full py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#07060D] flex justify-center z-20 content-visibility-auto">
          <div className="w-full max-w-2xl">
            <EyeOfAgamotto fallbackDate={earliestActiveDate} />
          </div>
        </section>
      </SectionErrorBoundary>

      {/* Scene 6: Sanctum About Narrative */}
      <SectionErrorBoundary sectionName="about">
        <div className="content-visibility-auto">
          <SanctumAbout />
        </div>
      </SectionErrorBoundary>

      {/* Multiverse Partner Marquee (Rendered only if festival.ts sponsors exist) */}
      <SponsorMarquee />

      {/* Scene 7: Final Gateway (Register for Strange / Live Open Status) */}
      <SectionErrorBoundary sectionName="final-gateway">
        <div className="content-visibility-auto">
          <FinalGateway events={events} />
        </div>
      </SectionErrorBoundary>
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
