import { useState, type FC } from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Wordmark } from '../components/ui/Wordmark';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Chip } from '../components/ui/Chip';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { NotFound } from '../components/states/NotFound';
import type { EventStatus, RegistrationStatus } from '../lib/types';

export const StyleguidePage: FC = () => {
  useDocumentMeta({
    title: 'Styleguide — PULSE',
    description: 'Interactive design system and component showcase for PULSE.',
  });

  // State for interactive chip demonstration
  const [selectedChips, setSelectedChips] = useState<Record<string, boolean>>({
    Coding: true,
    Competitions: false,
    Workshop: true,
    Online: false,
    Design: false,
  });

  // State for interactive error retry demonstration
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#e50914] bg-[#e50914]/10 px-2 py-1 rounded-[4px]">
          Developer Sandbox
        </span>
        <h1 className="text-4xl md:text-5xl font-display font-normal tracking-wide text-white mt-4 mb-2">
          PULSE DESIGN SYSTEM & STYLEGUIDE
        </h1>
        <p className="text-base text-[#b3b3b3] max-w-2xl">
          Tokens, components, accessibility standards, and state views adhering strictly to PROJECT.md
          guidelines and WCAG AA contrast standards.
        </p>
      </div>

      {/* 1. Theme Tokens & Color Palette */}
      <section aria-labelledby="tokens-heading" className="space-y-6">
        <h2 id="tokens-heading" className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-2 h-6 bg-[#e50914] rounded-sm" />
          1. Theme Tokens & Contrast
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-[4px] bg-[#141414] border border-white/10 space-y-1">
            <div className="h-12 rounded-[4px] bg-[#141414] border border-white/20" />
            <p className="text-xs font-bold text-white">Background</p>
            <p className="text-xs font-mono text-[#b3b3b3]">#141414</p>
          </div>
          <div className="p-4 rounded-[4px] bg-[#181818] border border-white/10 space-y-1">
            <div className="h-12 rounded-[4px] bg-[#181818]" />
            <p className="text-xs font-bold text-white">Surface</p>
            <p className="text-xs font-mono text-[#b3b3b3]">#181818</p>
          </div>
          <div className="p-4 rounded-[4px] bg-[#2f2f2f] border border-white/10 space-y-1">
            <div className="h-12 rounded-[4px] bg-[#2f2f2f]" />
            <p className="text-xs font-bold text-white">Hover Surface</p>
            <p className="text-xs font-mono text-[#b3b3b3]">#2F2F2F</p>
          </div>
          <div className="p-4 rounded-[4px] bg-[#181818] border border-white/10 space-y-1">
            <div className="h-12 rounded-[4px] bg-[#e50914]" />
            <p className="text-xs font-bold text-white">Accent</p>
            <p className="text-xs font-mono text-[#b3b3b3]">#E50914</p>
          </div>
          <div className="p-4 rounded-[4px] bg-[#181818] border border-white/10 space-y-1">
            <div className="h-12 rounded-[4px] bg-[#ffffff]" />
            <p className="text-xs font-bold text-white">Text Primary</p>
            <p className="text-xs font-mono text-[#b3b3b3]">#FFFFFF</p>
          </div>
          <div className="p-4 rounded-[4px] bg-[#181818] border border-white/10 space-y-1">
            <div className="h-12 rounded-[4px] bg-[#b3b3b3]" />
            <p className="text-xs font-bold text-white">Text Muted</p>
            <p className="text-xs font-mono text-[#b3b3b3]">#B3B3B3</p>
          </div>
        </div>

        {/* Contrast Verification Matrix */}
        <div className="overflow-x-auto bg-[#181818] rounded-[4px] border border-white/10 p-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#b3b3b3]">
                <th className="py-2 pr-4 font-semibold">Foreground</th>
                <th className="py-2 px-4 font-semibold">Background</th>
                <th className="py-2 px-4 font-semibold">Contrast Ratio</th>
                <th className="py-2 px-4 font-semibold">WCAG Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              <tr>
                <td className="py-2 pr-4">#FFFFFF (White)</td>
                <td className="py-2 px-4">#141414 (Dark Base)</td>
                <td className="py-2 px-4 font-mono font-bold text-emerald-400">17.5 : 1</td>
                <td className="py-2 px-4"><span className="text-emerald-400 font-bold">Passes AAA</span></td>
              </tr>
              <tr>
                <td className="py-2 pr-4">#B3B3B3 (Muted Gray)</td>
                <td className="py-2 px-4">#141414 (Dark Base)</td>
                <td className="py-2 px-4 font-mono font-bold text-emerald-400">8.6 : 1</td>
                <td className="py-2 px-4"><span className="text-emerald-400 font-bold">Passes AAA</span></td>
              </tr>
              <tr>
                <td className="py-2 pr-4">#FFFFFF (White)</td>
                <td className="py-2 px-4">#E50914 (Accent Red)</td>
                <td className="py-2 px-4 font-mono font-bold text-emerald-400">4.6 : 1</td>
                <td className="py-2 px-4"><span className="text-emerald-400 font-bold">Passes AA</span> (Normal text)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">#6EE7B7 (Registration Open)</td>
                <td className="py-2 px-4">#064E3B (Emerald Dark)</td>
                <td className="py-2 px-4 font-mono font-bold text-emerald-400">7.8 : 1</td>
                <td className="py-2 px-4"><span className="text-emerald-400 font-bold">Passes AAA</span></td>
              </tr>
              <tr>
                <td className="py-2 pr-4">#FCA5A5 (Sold Out Red)</td>
                <td className="py-2 px-4">#450A0A (Dark Red)</td>
                <td className="py-2 px-4 font-mono font-bold text-emerald-400">7.2 : 1</td>
                <td className="py-2 px-4"><span className="text-emerald-400 font-bold">Passes AAA</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Wordmark Showcase */}
      <section aria-labelledby="wordmark-heading" className="space-y-6">
        <h2 id="wordmark-heading" className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-2 h-6 bg-[#e50914] rounded-sm" />
          2. Brand Wordmark (Text "PULSE" with "P" in Accent Red)
        </h2>
        <div className="bg-[#181818] p-6 rounded-[4px] border border-white/10 space-y-6">
          <div className="flex flex-wrap items-baseline gap-8">
            <div>
              <p className="text-xs text-[#b3b3b3] mb-1">Small</p>
              <Wordmark size="sm" asLink={false} />
            </div>
            <div>
              <p className="text-xs text-[#b3b3b3] mb-1">Medium (Default Nav)</p>
              <Wordmark size="md" asLink={false} />
            </div>
            <div>
              <p className="text-xs text-[#b3b3b3] mb-1">Large</p>
              <Wordmark size="lg" asLink={false} />
            </div>
            <div>
              <p className="text-xs text-[#b3b3b3] mb-1">Extra Large (Display)</p>
              <Wordmark size="xl" asLink={false} />
            </div>
          </div>
          <p className="text-xs text-[#b3b3b3]">
            Wordmark is implemented as live semantic HTML text in heavy condensed caps (Bebas Neue) with no raster images.
          </p>
        </div>
      </section>

      {/* 3. Buttons */}
      <section aria-labelledby="buttons-heading" className="space-y-6">
        <h2 id="buttons-heading" className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-2 h-6 bg-[#e50914] rounded-sm" />
          3. Button Components
        </h2>
        <div className="bg-[#181818] p-6 rounded-[4px] border border-white/10 space-y-6">
          {/* Variants */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">Variants</p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary Accent</Button>
              <Button variant="secondary">Secondary Surface</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">Sizes</p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small Button</Button>
              <Button size="md">Medium Button (Default)</Button>
              <Button size="lg">Large Button</Button>
            </div>
          </div>

          {/* States */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">States</p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button isLoading={true}>Saving</Button>
              <Button disabled={true}>Disabled Button</Button>
              <Button
                variant="primary"
                leftIcon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                }
              >
                With Icon
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Badges & StatusBadges */}
      <section aria-labelledby="badges-heading" className="space-y-6">
        <h2 id="badges-heading" className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-2 h-6 bg-[#e50914] rounded-sm" />
          4. Badges & StatusBadges
        </h2>
        <div className="bg-[#181818] p-6 rounded-[4px] border border-white/10 space-y-6">
          {/* General Badges */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">General Badges</p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="accent">Featured</Badge>
              <Badge variant="surface">Technical</Badge>
              <Badge variant="muted">Free Event</Badge>
              <Badge variant="outline">Offline</Badge>
            </div>
          </div>

          {/* Event Status Badges */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">
              Event Status Badges (Always text labelled, separate from registration)
            </p>
            <div className="flex flex-wrap gap-3">
              {(['ACTIVE', 'COMPLETED', 'CLOSED'] as EventStatus[]).map((status) => (
                <StatusBadge key={status} type="event" status={status} />
              ))}
            </div>
          </div>

          {/* Registration Status Badges */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">
              Registration Status Badges (Never inferred from ACTIVE)
            </p>
            <div className="flex flex-wrap gap-3">
              {(['OPEN', 'CLOSED', 'SOLD_OUT'] as RegistrationStatus[]).map((status) => (
                <StatusBadge key={status} type="registration" status={status} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Chips */}
      <section aria-labelledby="chips-heading" className="space-y-6">
        <h2 id="chips-heading" className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-2 h-6 bg-[#e50914] rounded-sm" />
          5. Interactive Chips (Filter Toggles with aria-pressed)
        </h2>
        <div className="bg-[#181818] p-6 rounded-[4px] border border-white/10 space-y-4">
          <p className="text-sm text-[#b3b3b3]">
            Click or navigate via keyboard (Tab, Enter/Space) to toggle. Includes live count badges.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(selectedChips).map(([label, selected], idx) => (
              <Chip
                key={label}
                label={label}
                selected={selected}
                onToggle={() => toggleChip(label)}
                count={[12, 6, 8, 4, 9][idx % 5]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Skeletons */}
      <section aria-labelledby="skeletons-heading" className="space-y-6">
        <h2 id="skeletons-heading" className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-2 h-6 bg-[#e50914] rounded-sm" />
          6. Skeletons (Fixed Aspect Ratio & Opacity Animation)
        </h2>
        <div className="bg-[#181818] p-6 rounded-[4px] border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#b3b3b3]">Card 3:2 Aspect Ratio</p>
            <Skeleton variant="card" />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#b3b3b3]">Row Item Skeleton</p>
            <Skeleton variant="card" />
            <Skeleton variant="text" width="85%" />
            <Skeleton variant="text" width="50%" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#b3b3b3]">Profile / Coordinator Circle</p>
            <div className="flex items-center gap-4">
              <Skeleton variant="circle" width={56} height={56} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. State Views */}
      <section aria-labelledby="states-heading" className="space-y-8">
        <h2 id="states-heading" className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-2 h-6 bg-[#e50914] rounded-sm" />
          7. State Views (Empty, Error + Retry, Not Found)
        </h2>

        {/* Empty State */}
        <div className="bg-[#181818] p-6 rounded-[4px] border border-white/10">
          <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-4">
            A. Empty State (Zero results found)
          </p>
          <EmptyState
            title="No events match your filters"
            description="We couldn't find any events matching this theme. Try clearing the filter chips or search keywords."
            action={
              <Button variant="secondary" size="sm" onClick={() => setSelectedChips({})}>
                Reset all filters
              </Button>
            }
          />
        </div>

        {/* Error State with Interactive Retry */}
        <div className="bg-[#181818] p-6 rounded-[4px] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
              B. Error State (With Retry CTA)
            </p>
            <span className="text-xs text-[#b3b3b3]">
              Retries triggered:{' '}
              <span className="font-mono font-bold text-white">{retryCount}</span>
            </span>
          </div>
          <ErrorState
            title="Failed to fetch event catalogue"
            message="The network connection timed out after 8 seconds. Please check your internet or retry."
            errorKind="timeout"
            onRetry={handleSimulatedRetry}
            isRetrying={isRetrying}
          />
        </div>

        {/* Not Found View */}
        <div className="bg-[#181818] p-6 rounded-[4px] border border-white/10">
          <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-4">
            C. Not Found State (404 View)
          </p>
          <NotFound
            title="Event Not Found"
            message="This event ID is either invalid, unpublished, or has been permanently archived."
          />
        </div>
      </section>
    </div>
  );
};
