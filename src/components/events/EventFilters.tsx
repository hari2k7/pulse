import type { FC } from 'react';
import { THEMES } from '../../lib/themes';
import { toggleArrayItem, type EventFilterState } from '../../lib/filters';

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
        <h2 className="text-xs font-bold text-[#F3EFE8] uppercase tracking-wider font-display">
          Filters
        </h2>
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
          Theme
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {THEMES.filter((t) => t !== 'More').map((theme) => {
            const isSelected = filters.themes.includes(theme);
            const count = themeCounts[theme] ?? 0;
            return (
              <button
                key={theme}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ themes: toggleArrayItem(filters.themes, theme) })}
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
          Format
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'EVENT' as const, label: 'Competitions' },
            { value: 'WORKSHOP' as const, label: 'Workshops' },
          ].map((opt) => {
            const isSelected = filters.types.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ types: toggleArrayItem(filters.types, opt.value) })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                    : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 3. Delivery Mode */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Mode
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'OFFLINE' as const, label: 'In-Person' },
            { value: 'ONLINE' as const, label: 'Virtual' },
          ].map((opt) => {
            const isSelected = filters.modes.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ modes: toggleArrayItem(filters.modes, opt.value) })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                    : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 4. Pricing / Admission */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Admission
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'free' as const, label: 'Free' },
            { value: 'paid' as const, label: 'Paid' },
          ].map((opt) => {
            const isSelected = filters.prices.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ prices: toggleArrayItem(filters.prices, opt.value) })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                    : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 5. Registration Status */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Status
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'OPEN' as const, label: 'Open' },
            { value: 'CLOSED' as const, label: 'Closed' },
            { value: 'SOLD_OUT' as const, label: 'Sold Out' },
          ].map((opt) => {
            const isSelected = filters.statuses.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ statuses: toggleArrayItem(filters.statuses, opt.value) })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                    : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 6. Technical Track */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Track
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'technical' as const, label: 'Technical' },
            { value: 'non-technical' as const, label: 'Non-Technical' },
          ].map((opt) => {
            const isSelected = filters.technical.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ technical: toggleArrayItem(filters.technical, opt.value) })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                    : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};
