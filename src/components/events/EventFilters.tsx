import type { FC } from 'react';
import { THEMES } from '../../lib/themes';
import type { EventFilterState, PriceFilterOption } from '../../lib/filters';
import { Button } from '../ui/Button';

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
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Filter Events
        </h3>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[#e50914] hover:text-[#f40612] font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] rounded"
          >
            Clear all
          </button>
        )}
      </div>

      {/* 1. Themes */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Theme
        </legend>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            role="button"
            aria-pressed={filters.theme === 'all'}
            onClick={() => onChange({ theme: 'all' })}
            className={`text-xs px-2.5 py-1 rounded-[4px] font-medium border transition-colors ${
              filters.theme === 'all'
                ? 'bg-[#e50914] text-white border-[#e50914]'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
            }`}
          >
            All Themes
          </button>
          {THEMES.filter((t) => t !== 'More').map((theme) => {
            const isSelected = filters.theme === theme;
            const count = themeCounts[theme];
            return (
              <button
                key={theme}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ theme: isSelected ? 'all' : theme })}
                className={`text-xs px-2.5 py-1 rounded-[4px] font-medium border transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#e50914] text-white border-[#e50914]'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <span>{theme}</span>
                {typeof count === 'number' && count > 0 && (
                  <span
                    className={`text-[10px] px-1 rounded-full font-mono ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-zinc-400'
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

      {/* 2. Event Mode (Offline / Online) */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Event Mode
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'all', label: 'All Modes' },
            { value: 'OFFLINE', label: 'Offline' },
            { value: 'ONLINE', label: 'Online' },
          ].map((item) => {
            const isSelected = filters.mode === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ mode: item.value })}
                className={`text-xs px-2.5 py-1 rounded-[4px] font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#e50914] text-white border-[#e50914]'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 3. Event Type (Event vs Workshop) */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Format
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'all', label: 'All Formats' },
            { value: 'EVENT', label: 'Events & Challenges' },
            { value: 'WORKSHOP', label: 'Workshops' },
          ].map((item) => {
            const isSelected = filters.type === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ type: item.value })}
                className={`text-xs px-2.5 py-1 rounded-[4px] font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#e50914] text-white border-[#e50914]'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 4. Price (Free vs Paid) */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Admission
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'all', label: 'All' },
            { value: 'free', label: 'Free to Join' },
            { value: 'paid', label: 'Paid Entry' },
          ].map((item) => {
            const isSelected = filters.price === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ price: item.value as PriceFilterOption })}
                className={`text-xs px-2.5 py-1 rounded-[4px] font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#e50914] text-white border-[#e50914]'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 5. Registration Status */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Registration Status
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'all', label: 'All' },
            { value: 'OPEN', label: 'Open' },
            { value: 'SOLD_OUT', label: 'Sold Out' },
            { value: 'CLOSED', label: 'Closed' },
          ].map((item) => {
            const isSelected = filters.status === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ status: item.value })}
                className={`text-xs px-2.5 py-1 rounded-[4px] font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#e50914] text-white border-[#e50914]'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 6. Checkbox Toggles: Technical Only & Show Past Events */}
      <div className="space-y-3 pt-3 border-t border-white/10">
        {/* Technical Only Toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={filters.technicalOnly}
            onChange={(e) => onChange({ technicalOnly: e.target.checked })}
            className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-[#e50914] focus:ring-[#e50914] focus:ring-offset-zinc-950 cursor-pointer"
          />
          <span className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">
            Technical events only
          </span>
        </label>

        {/* Show Past Events Toggle (Off by default) */}
        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={filters.showPast}
            onChange={(e) => onChange({ showPast: e.target.checked })}
            className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-[#e50914] focus:ring-[#e50914] focus:ring-offset-zinc-950 cursor-pointer"
          />
          <span className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">
            Show past events (Completed / Closed)
          </span>
        </label>
      </div>

      {/* Mobile-only Done / Clear Actions */}
      {hasActive && (
        <div className="pt-2">
          <Button variant="secondary" size="sm" onClick={onReset} className="w-full">
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};
