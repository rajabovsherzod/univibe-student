'use client';

import { useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterChip[];
  onFilterChange?: (filterId: string, value: string | null) => void;
  sortOptions?: SortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
}

interface FilterChip {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value: string | null;
}

interface SortOption {
  value: string;
  label: string;
}

export function FilterBar({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filters = [],
  onFilterChange,
  sortOptions = [],
  sortValue,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Sort Dropdown */}
        {sortOptions.length > 0 && (
          <div className="relative w-full sm:w-48">
            <select
              value={sortValue}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="
                w-full px-4 py-2.5 pr-10 text-sm appearance-none
                bg-bg-secondary border border-border-primary rounded-lg
                text-fg-primary cursor-pointer
                hover:border-border-brand
                focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900
              "
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-tertiary pointer-events-none" />
          </div>
        )}
      </div>

      {/* Filter Chips */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <FilterChipDropdown
              key={filter.id}
              filter={filter}
              onChange={(value) => onFilterChange?.(filter.id, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterChipDropdownProps {
  filter: FilterChip;
  onChange: (value: string | null) => void;
}

function FilterChipDropdown({ filter, onChange }: FilterChipDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = filter.options.find((o) => o.value === filter.value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full
          border transition-colors
          focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
          ${filter.value
            ? 'bg-brand-50 dark:bg-brand-950 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300'
            : 'bg-bg-secondary border-border-primary text-fg-secondary hover:border-border-brand'
          }
        `}
      >
        {selectedOption ? selectedOption.label : filter.label}
        {filter.value ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              setIsOpen(false);
            }}
            className="hover:text-brand-800 dark:hover:text-brand-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 z-20 min-w-36 bg-bg-secondary border border-border-secondary rounded-lg shadow-lg py-1 animate-fade-in">
            {filter.options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 text-sm
                  hover:bg-bg-tertiary transition-colors
                  ${filter.value === option.value ? 'text-brand-600 dark:text-brand-400 font-medium' : 'text-fg-primary'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Quick Filter Pills (simple toggle)
interface QuickFilterProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function QuickFilters({ options, value, onChange }: QuickFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full
            border transition-all duration-150
            focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900
            ${value === option.value
              ? 'bg-brand-600 border-brand-600 text-white'
              : 'bg-bg-secondary border-border-primary text-fg-secondary hover:border-border-brand'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
