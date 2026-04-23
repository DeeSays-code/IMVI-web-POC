export interface FilterOption<T extends string> {
  value: T;
  label: string;
  /** Optional count badge shown alongside the label. */
  count?: number;
}

export interface FilterPillsProps<T extends string> {
  options: ReadonlyArray<FilterOption<T>>;
  selected: T;
  onSelect: (value: T) => void;
  /** Size preset — default matches Review Queue filter button height. */
  size?: 'sm' | 'md';
}

/**
 * Rounded pill-button group for filter toggles. Used across Teams Directory,
 * Media Library, User Management. Single-select; the selected pill takes the
 * gold-3 bordered + bone text treatment.
 */
export function FilterPills<T extends string>({
  options,
  selected,
  onSelect,
  size = 'md',
}: FilterPillsProps<T>) {
  const dims =
    size === 'sm'
      ? 'h-8 px-3 text-[10px]'
      : 'h-10 px-4 text-[11px]';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            aria-pressed={isSelected}
            className={`${dims} flex items-center gap-2 rounded-full border font-display font-medium uppercase tracking-label-md transition-all duration-200 ease-standard ${
              isSelected
                ? 'border-gold-3/60 bg-gold-3/10 text-bone hover:border-gold-3/80'
                : 'border-bone-muted/15 bg-ink-2 text-bone-muted hover:border-bone-muted/30 hover:text-bone'
            }`}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`flex min-w-[20px] items-center justify-center rounded-full px-1.5 font-display text-[9px] font-bold tracking-data-tight ${
                  isSelected ? 'bg-gold-3/25 text-gold-4' : 'bg-bone-muted/10 text-bone-muted'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
