import type { FC } from 'react';
import { toggleArrayItem, type EventFilterState, type DatePreset } from '../../lib/filters';

export interface EventFiltersProps {
  filters: EventFilterState;
  onChange: (updated: Partial<EventFilterState>) => void;
  onReset: () => void;
  hasActive: boolean;
  className?: string;
}

export const EventFilters: FC<EventFiltersProps> = ({
  filters,
  onChange,
  onReset,
  hasActive,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Clear All button */}
      <div className="flex items-center justify-between pb-3 border-b border-[#FF7A1A]/20">
        <h2 className="text-xs font-bold text-[#F3EFE8] uppercase tracking-wider font-display">
          Archive Controls
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

      {/* 1. Date Presets (Today, This week, This month, All) */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Schedule Preset
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'all' as DatePreset, label: 'All Dates' },
            { value: 'today' as DatePreset, label: 'Today' },
            { value: 'this_week' as DatePreset, label: 'This Week' },
            { value: 'this_month' as DatePreset, label: 'This Month' },
          ].map((preset) => {
            const isSelected = filters.datePreset === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ datePreset: preset.value })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#FF7A1A] text-[#07060D] font-bold border-[#FF7A1A]'
                    : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#FF7A1A]/40 hover:text-[#F3EFE8]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 2. Curated Saved Only Toggle (Favorites) */}
      <div className="pt-1">
        <button
          type="button"
          aria-pressed={filters.savedOnly}
          onClick={() => onChange({ savedOnly: !filters.savedOnly })}
          className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-md font-semibold border transition-colors ${
            filters.savedOnly
              ? 'bg-[#E11D48]/20 border-[#E11D48] text-[#F3EFE8]'
              : 'bg-[#0D1020] text-[#B8B3C7] border-white/10 hover:border-[#E11D48]/40 hover:text-[#F3EFE8]'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg
              className={`w-3.5 h-3.5 ${filters.savedOnly ? 'fill-[#E11D48] text-[#E11D48]' : 'text-[#B8B3C7]'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              fill={filters.savedOnly ? '#E11D48' : 'none'}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Saved Only (Favorites)</span>
          </span>
          {filters.savedOnly && (
            <span className="text-[10px] font-mono text-[#E11D48] font-bold uppercase">Active</span>
          )}
        </button>
      </div>

      {/* 3. Registration Status (Open, Closed, Sold Out) */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Registration
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

      {/* 4. Format / Type (Competitions, Workshops) */}
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

      {/* 5. Access / Pricing (Free, Paid) */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Access
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

      {/* 6. Delivery Mode (Offline, Online) */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-[#B8B3C7] uppercase tracking-wider">
          Delivery Mode
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'OFFLINE' as const, label: 'In-Person (Campus)' },
            { value: 'ONLINE' as const, label: 'Online' },
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

      {/* 7. Technical Track (Technical, Non-technical) */}
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

      {/* 8. Past Events Toggle */}
      <div className="pt-2 border-t border-white/10">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.showPast}
            onChange={(e) => onChange({ showPast: e.target.checked })}
            className="w-4 h-4 rounded bg-[#0D1020] border-white/20 text-[#FF7A1A] focus:ring-[#FF7A1A]"
          />
          <span className="text-xs font-medium text-[#B8B3C7]">
            Include past events
          </span>
        </label>
      </div>
    </div>
  );
};
