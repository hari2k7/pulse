import { useState, type FC } from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { StrangeLogo } from '../components/strange/StrangeLogo';
import { Glyph, type GlyphType } from '../components/strange/DimensionalGlyphs';
import { SpellCircleRings } from '../components/strange/SpellCircleRings';
import { SanctumSeal } from '../components/strange/SanctumSeal';
import { EyeOfAgamotto } from '../components/strange/EyeOfAgamotto';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Chip } from '../components/ui/Chip';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { NotFound } from '../components/states/NotFound';
import { EventCard } from '../components/events/EventCard';
import type { EventSummary } from '../lib/types';

export const StyleguidePage: FC = () => {
  useDocumentMeta({
    title: 'Styleguide — STRANGE',
    description: 'Interactive design system and component showcase for STRANGE — A Tech Fest Beyond Reality.',
  });

  // State for interactive chip demonstration
  const [selectedChips, setSelectedChips] = useState<Record<string, boolean>>({
    'Tech & Code': true,
    'Hackathon': true,
    'Workshops': false,
    'Robotics': false,
    'Design': false,
  });

  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const toggleChip = (name: string) => {
    setSelectedChips((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSimulatedRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      setIsRetrying(false);
    }, 800);
  };

  // Sample real-shaped event for demonstration
  const sampleEvent: EventSummary = {
    id: 'sample-strange-event',
    name: 'Multiverse Code Crucible: Grand 36H Hackathon',
    blurb: 'Traverse dimensions of AI and cloud systems to forge algorithmic solutions across parallel realities.',
    cover_image_url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    cover_image_alt: 'Engineers collaborating on laptops in a neon-lit room',
    category: 'Hackathon',
    tags: ['AI', 'Quantum', 'FullStack'],
    event_type: 'EVENT',
    event_mode: 'OFFLINE',
    event_status: 'ACTIVE',
    is_featured: true,
    is_technical: true,
    price: 0,
    is_per_head: false,
    min_teamsize: 2,
    max_teamsize: 4,
    total_seats: 50,
    seats_filled: 46,
    registration_status: 'OPEN',
    registration_deadline: '2026-11-12T23:59:00+05:30',
    schedule_summary: {
      start_date: '2026-11-14',
      start_time: '09:00',
      end_date: '2026-11-15',
      end_time: '18:00',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-16 space-y-16">
      {/* Header */}
      <div className="border-b border-[#FF7A1A]/20 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF7A1A] bg-[#FF7A1A]/10 px-2.5 py-1 rounded-md border border-[#FF7A1A]/30">
          Dimensional Design System
        </span>
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wide text-[#F3EFE8] mt-4 mb-2">
          STRANGE DESIGN SYSTEM
        </h1>
        <p className="text-base text-[#B8B3C7] max-w-2xl">
          Tokens, original mystic vector artifacts, typography, motion curves, and accessibility matrices adhering strictly to WCAG AA contrast standards.
        </p>
      </div>

      {/* 1. Theme Tokens & Color Palette */}
      <section aria-labelledby="tokens-heading" className="space-y-6">
        <h2 id="tokens-heading" className="text-2xl font-display font-bold text-[#F3EFE8] flex items-center gap-3">
          <span className="w-2 h-6 bg-[#FF7A1A] rounded-sm" />
          1. Cosmic Palette & Tokens
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-md bg-[#07060D] border border-white/10 space-y-1">
            <div className="h-12 rounded bg-[#07060D] border border-white/20" />
            <p className="text-xs font-bold text-[#F3EFE8]">Midnight</p>
            <p className="text-xs font-mono text-[#B8B3C7]">#07060D</p>
          </div>
          <div className="p-4 rounded-md bg-[#0D1020] border border-white/10 space-y-1">
            <div className="h-12 rounded bg-[#0D1020]" />
            <p className="text-xs font-bold text-[#F3EFE8]">Navy Surface</p>
            <p className="text-xs font-mono text-[#B8B3C7]">#0D1020</p>
          </div>
          <div className="p-4 rounded-md bg-[#1A1030] border border-white/10 space-y-1">
            <div className="h-12 rounded bg-[#1A1030]" />
            <p className="text-xs font-bold text-[#F3EFE8]">Violet Dark</p>
            <p className="text-xs font-mono text-[#B8B3C7]">#1A1030</p>
          </div>
          <div className="p-4 rounded-md bg-[#0D1020] border border-white/10 space-y-1">
            <div className="h-12 rounded bg-[#FF7A1A]" />
            <p className="text-xs font-bold text-[#F3EFE8]">Portal Orange</p>
            <p className="text-xs font-mono text-[#B8B3C7]">#FF7A1A</p>
          </div>
          <div className="p-4 rounded-md bg-[#0D1020] border border-white/10 space-y-1">
            <div className="h-12 rounded bg-[#F5B642]" />
            <p className="text-xs font-bold text-[#F3EFE8]">Portal Gold</p>
            <p className="text-xs font-mono text-[#B8B3C7]">#F5B642</p>
          </div>
          <div className="p-4 rounded-md bg-[#0D1020] border border-white/10 space-y-1">
            <div className="h-12 rounded bg-[#3BA3FF]" />
            <p className="text-xs font-bold text-[#F3EFE8]">Electric Blue</p>
            <p className="text-xs font-mono text-[#B8B3C7]">#3BA3FF</p>
          </div>
          <div className="p-4 rounded-md bg-[#0D1020] border border-white/10 space-y-1">
            <div className="h-12 rounded bg-[#3DDC97]" />
            <p className="text-xs font-bold text-[#F3EFE8]">Magic Green</p>
            <p className="text-xs font-mono text-[#B8B3C7]">#3DDC97</p>
          </div>
          <div className="p-4 rounded-md bg-[#0D1020] border border-white/10 space-y-1">
            <div className="h-12 rounded bg-[#A66BFF]" />
            <p className="text-xs font-bold text-[#F3EFE8]">Mystic Violet</p>
            <p className="text-xs font-mono text-[#B8B3C7]">#A66BFF</p>
          </div>
          <div className="p-4 rounded-md bg-[#0D1020] border border-white/10 space-y-1">
            <div className="h-12 rounded bg-[#C8102E]" />
            <p className="text-xs font-bold text-[#F3EFE8]">Cloak Red</p>
            <p className="text-xs font-mono text-[#B8B3C7]">#C8102E</p>
          </div>
          <div className="p-4 rounded-md bg-[#0D1020] border border-white/10 space-y-1">
            <div className="h-12 rounded bg-[#F3EFE8]" />
            <p className="text-xs font-bold text-[#07060D]">Text Primary</p>
            <p className="text-xs font-mono text-[#B8B3C7]">#F3EFE8</p>
          </div>
        </div>

        {/* Contrast Verification Matrix */}
        <div className="overflow-x-auto bg-[#0D1020] rounded-md border border-[#FF7A1A]/20 p-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#B8B3C7]">
                <th className="py-2.5 pr-4 font-semibold">Foreground</th>
                <th className="py-2.5 px-4 font-semibold">Background</th>
                <th className="py-2.5 px-4 font-semibold">Contrast Ratio</th>
                <th className="py-2.5 px-4 font-semibold">WCAG Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#F3EFE8]">
              <tr>
                <td className="py-2.5 pr-4">#F3EFE8 (Text Primary)</td>
                <td className="py-2.5 px-4">#07060D (Midnight Void)</td>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">17.2 : 1</td>
                <td className="py-2.5 px-4"><span className="text-emerald-400 font-bold">Passes AAA</span></td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4">#B8B3C7 (Text Muted)</td>
                <td className="py-2.5 px-4">#07060D (Midnight Void)</td>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">10.1 : 1</td>
                <td className="py-2.5 px-4"><span className="text-emerald-400 font-bold">Passes AAA</span></td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4">#07060D (Dark Core)</td>
                <td className="py-2.5 px-4">#FF7A1A (Portal Orange CTA)</td>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">8.4 : 1</td>
                <td className="py-2.5 px-4"><span className="text-emerald-400 font-bold">Passes AAA</span></td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4">#3DDC97 (Magic Green)</td>
                <td className="py-2.5 px-4">#07060D (Midnight Void)</td>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">11.8 : 1</td>
                <td className="py-2.5 px-4"><span className="text-emerald-400 font-bold">Passes AAA</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Brand Wordmark & Sigil */}
      <section aria-labelledby="wordmark-heading" className="space-y-6">
        <h2 id="wordmark-heading" className="text-2xl font-display font-bold text-[#F3EFE8] flex items-center gap-3">
          <span className="w-2 h-6 bg-[#FF7A1A] rounded-sm" />
          2. STRANGE Wordmark & Circular Sigil
        </h2>
        <div className="bg-[#0D1020] p-6 rounded-md border border-[#FF7A1A]/20 space-y-6">
          <div className="flex flex-wrap items-baseline gap-8">
            <div>
              <p className="text-xs text-[#B8B3C7] mb-2">Small</p>
              <StrangeLogo size="sm" asLink={false} />
            </div>
            <div>
              <p className="text-xs text-[#B8B3C7] mb-2">Medium (Navbar)</p>
              <StrangeLogo size="md" asLink={false} />
            </div>
            <div>
              <p className="text-xs text-[#B8B3C7] mb-2">Large</p>
              <StrangeLogo size="lg" asLink={false} />
            </div>
            <div>
              <p className="text-xs text-[#B8B3C7] mb-2">Display (With Tagline)</p>
              <StrangeLogo size="lg" withTagline={true} asLink={false} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dimensional Glyphs */}
      <section aria-labelledby="glyphs-heading" className="space-y-6">
        <h2 id="glyphs-heading" className="text-2xl font-display font-bold text-[#F3EFE8] flex items-center gap-3">
          <span className="w-2 h-6 bg-[#FF7A1A] rounded-sm" />
          3. Dimensional Navigation Glyphs
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {(['overview', 'schedule', 'prizes', 'rules', 'faqs', 'contacts'] as GlyphType[]).map((type) => (
            <div
              key={type}
              className="p-4 rounded-md bg-[#0D1020] border border-[#FF7A1A]/20 flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#1A1030] flex items-center justify-center text-[#FF7A1A]">
                <Glyph type={type} size={22} />
              </div>
              <span className="text-xs font-semibold capitalize text-[#F3EFE8]">{type}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Mystic Vector Artifacts */}
      <section aria-labelledby="artifacts-heading" className="space-y-6">
        <h2 id="artifacts-heading" className="text-2xl font-display font-bold text-[#F3EFE8] flex items-center gap-3">
          <span className="w-2 h-6 bg-[#FF7A1A] rounded-sm" />
          4. Mystic Vector Artifacts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-md bg-[#0D1020] border border-[#FF7A1A]/20 flex flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-wider text-[#F5B642] mb-4">Spell Circle Rings</p>
            <SpellCircleRings size={180} color="orange" />
          </div>
          <div className="p-6 rounded-md bg-[#0D1020] border border-[#FF7A1A]/20 flex flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-wider text-[#F5B642] mb-4">Sanctum Seal</p>
            <SanctumSeal size={180} />
          </div>
          <div className="p-6 rounded-md bg-[#0D1020] border border-[#FF7A1A]/20 flex flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-wider text-[#F5B642] mb-4">Eye of Agamotto</p>
            <EyeOfAgamotto fallbackDate="2026-11-13T09:00:00+05:30" className="w-full max-w-xs" />
          </div>
        </div>
      </section>

      {/* 5. Buttons */}
      <section aria-labelledby="buttons-heading" className="space-y-6">
        <h2 id="buttons-heading" className="text-2xl font-display font-bold text-[#F3EFE8] flex items-center gap-3">
          <span className="w-2 h-6 bg-[#FF7A1A] rounded-sm" />
          5. Button Components
        </h2>
        <div className="bg-[#0D1020] p-6 rounded-md border border-[#FF7A1A]/20 space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Explore Events</Button>
            <Button variant="secondary">Sanctum Index</Button>
            <Button variant="outline">View Rules</Button>
            <Button variant="ghost">Dismiss</Button>
            <Button variant="primary" isLoading>Traversing...</Button>
          </div>
        </div>
      </section>

      {/* 6. Event Card Sample */}
      <section aria-labelledby="cards-heading" className="space-y-6">
        <h2 id="cards-heading" className="text-2xl font-display font-bold text-[#F3EFE8] flex items-center gap-3">
          <span className="w-2 h-6 bg-[#FF7A1A] rounded-sm" />
          6. Event Card Showcase
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <EventCard event={sampleEvent} />
        </div>
      </section>

      {/* 7. Badges & Chips */}
      <section aria-labelledby="badges-heading" className="space-y-6">
        <h2 id="badges-heading" className="text-2xl font-display font-bold text-[#F3EFE8] flex items-center gap-3">
          <span className="w-2 h-6 bg-[#FF7A1A] rounded-sm" />
          7. Badges & Filter Chips
        </h2>
        <div className="bg-[#0D1020] p-6 rounded-md border border-[#FF7A1A]/20 space-y-6">
          <div>
            <p className="text-xs uppercase text-[#B8B3C7] mb-3">Status Badges</p>
            <div className="flex flex-wrap gap-3">
              <StatusBadge type="event" status="ACTIVE" />
              <StatusBadge type="event" status="COMPLETED" />
              <StatusBadge type="event" status="CLOSED" />
              <StatusBadge type="registration" status="OPEN" />
              <StatusBadge type="registration" status="CLOSED" />
              <StatusBadge type="registration" status="SOLD_OUT" />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-[#B8B3C7] mb-3">Attribute Badges</p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="accent">Featured</Badge>
              <Badge variant="surface">Free</Badge>
              <Badge variant="default">Offline</Badge>
              <Badge variant="outline">Technical</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-[#B8B3C7] mb-3">Interactive Dimension Chips</p>
            <div className="flex flex-wrap gap-2.5">
              {Object.entries(selectedChips).map(([name, isSelected]) => (
                <Chip
                  key={name}
                  label={name}
                  selected={isSelected}
                  onToggle={() => toggleChip(name)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Skeletons */}
      <section aria-labelledby="skeletons-heading" className="space-y-6">
        <h2 id="skeletons-heading" className="text-2xl font-display font-bold text-[#F3EFE8] flex items-center gap-3">
          <span className="w-2 h-6 bg-[#FF7A1A] rounded-sm" />
          8. Skeletons & Loading States
        </h2>
        <div className="bg-[#0D1020] p-6 rounded-md border border-[#FF7A1A]/20 space-y-4">
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="90%" height={16} />
          <div className="flex gap-4">
            <Skeleton variant="rect" width={120} height={40} />
            <Skeleton variant="rect" width={120} height={40} />
          </div>
        </div>
      </section>

      {/* 9. Feedback & Resilience States */}
      <section aria-labelledby="states-heading" className="space-y-6">
        <h2 id="states-heading" className="text-2xl font-display font-bold text-[#F3EFE8] flex items-center gap-3">
          <span className="w-2 h-6 bg-[#FF7A1A] rounded-sm" />
          9. Feedback & Failure States
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-md bg-[#0D1020] border border-[#FF7A1A]/20">
            <EmptyState title="No Events Discovered" description="Adjust your dimensional filters." />
          </div>
          <div className="p-4 rounded-md bg-[#0D1020] border border-[#FF7A1A]/20">
            <ErrorState
              title="Portal Disrupted"
              message={`Temporal rift occurred. Retry count: ${retryCount}`}
              onRetry={handleSimulatedRetry}
              isRetrying={isRetrying}
            />
          </div>
          <div className="p-4 rounded-md bg-[#0D1020] border border-[#FF7A1A]/20">
            <NotFound />
          </div>
        </div>
      </section>
    </div>
  );
};
