import type { FC } from 'react';
import { THEMES } from '../../lib/themes';
import type { EventFilterState, PriceFilterOption } from '../../lib/filters';

export interface EventFiltersProps {
  filters: EventFilterState;
  onChange: (updated: Partial<EventFilterState>) => void;
  onReset: () => void;
  hasActive: boolean;
  className?: string;
  themeCounts?: Record<string, number>;
}

export const EventFilters: FC<EventFiltersProps> = ({
  filters,
  onChange,
  onReset,
  hasActive,
  className = '',
  themeCounts = {},
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Clear All button */}
      <div className="flex items-center justify-between pb-3 border-b border-[#FF7A1A]/20">
        <h3 className="text-xs font-bold text-[#F3EFE8] uppercase tracking-[0.2em] font-display">
          Filter Multiverse
        </h3>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[#FF7A1A] hover:text-[#F5B642] font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] rounded"
          >
            Clear all
          </button>
        )}
      </div>

      {/* 1. Themes */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Dimension Theme
        </legend>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            role="button"
            aria-pressed={filters.theme === 'all'}
            onClick={() => onChange({ theme: 'all' })}
            className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
              filters.theme === 'all'
                ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
            }`}
          >
            All Themes
          </button>
          {THEMES.filter((t) => t !== 'More').map((theme) => {
            const isSelected = filters.theme === theme;
            const count = themeCounts[theme] ?? 0;
            return (
              <button
                key={theme}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ theme: isSelected ? 'all' : theme })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors inline-flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                    : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
                }`}
              >
                <span>{theme}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 rounded-full ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-[#1A1030] text-[#B8B3C7]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 2. Format / Type */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Event Format
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { value: 'all', label: 'All Formats' },
              { value: 'EVENT', label: 'Competitions & Events' },
              { value: 'WORKSHOP', label: 'Workshops' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="button"
              aria-pressed={filters.type === opt.value}
              onClick={() => onChange({ type: opt.value })}
              className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                filters.type === opt.value
                  ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                  : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* 3. Delivery Mode */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Mode
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { value: 'all', label: 'All Modes' },
              { value: 'OFFLINE', label: 'In-Person (Sanctum)' },
              { value: 'ONLINE', label: 'Virtual (Astral)' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="button"
              aria-pressed={filters.mode === opt.value}
              onClick={() => onChange({ mode: opt.value })}
              className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                filters.mode === opt.value
                  ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                  : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* 4. Pricing / Admission */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Admission
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { value: 'all', label: 'Any Price' },
              { value: 'free', label: 'Free Only' },
              { value: 'paid', label: 'Paid Pass' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="button"
              aria-pressed={filters.price === opt.value}
              onClick={() => onChange({ price: opt.value as PriceFilterOption })}
              className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                filters.price === opt.value
                  ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                  : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* 5. Registration Status */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Registration
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { value: 'all', label: 'All Statuses' },
              { value: 'OPEN', label: 'Open Now' },
              { value: 'SOLD_OUT', label: 'Sold Out' },
              { value: 'CLOSED', label: 'Closed' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="button"
              aria-pressed={filters.status === opt.value}
              onClick={() => onChange({ status: opt.value })}
              className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                filters.status === opt.value
                  ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                  : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* 6. Technical Focus Toggle */}
      <div className="pt-2">
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={filters.technicalOnly}
            onChange={(e) => onChange({ technicalOnly: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 bg-[#0D1020] text-[#3BA3FF] focus:ring-2 focus:ring-[#3BA3FF] focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-xs font-semibold text-[#F3EFE8] group-hover:text-[#3BA3FF] transition-colors">
            ⚡ Technical Realm Only
          </span>
        </label>
      </div>

      {/* 7. Show Past Events Toggle */}
      <div className="pt-1">
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={filters.showPast}
            onChange={(e) => onChange({ showPast: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 bg-[#0D1020] text-[#FF7A1A] focus:ring-2 focus:ring-[#FF7A1A] focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-xs font-medium text-[#B8B3C7] group-hover:text-[#F3EFE8] transition-colors">
            Include Closed / Completed events
          </span>
        </label>
      </div>
    </div>
  );
};
