import type { StylingApproach } from '../types/form-plan.js';
import type { ResolvedChoices } from '../loaders/choices-loader.js';

/**
 * For the HTML prototype, return the CSS grid class for a given column count.
 */
export function prototypeGridClass(columns: number): string {
  if (columns <= 1) return 'grid-1';
  if (columns === 2) return 'grid-2';
  if (columns === 3) return 'grid-3';
  return 'grid-4';
}

/**
 * For React scaffold, resolve the CSS class/config per styling approach.
 */
export function scaffoldGridClass(
  columns: number,
  approach: StylingApproach
): string {
  switch (approach) {
    case 'css-modules':
    case 'scss':
      return `styles.cols${columns}`;

    case 'plain-css':
      return `cols-${columns}`;

    case 'tailwind': {
      const map: Record<number, string> = {
        1: 'grid grid-cols-1 gap-4',
        2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
        3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
        4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
      };
      return map[columns] ?? map[1]!;
    }

    case 'bare':
      return ''; // Uses inline style with auto-fit

    case 'mui-grid':
    case 'antd-grid':
    case 'bootstrap-grid':
    case 'chakra':
      return `cols-${columns}`; // Config-driven, not CSS class

    default:
      return `grid-${columns}`;
  }
}

/**
 * For the prototype CSS, get the full-width field class.
 */
export function prototypeFullWidthClass(): string {
  return 'col-full';
}

/**
 * For React scaffold, get the full-width class/attribute per approach.
 */
export function scaffoldFullWidthClass(approach: StylingApproach): string {
  switch (approach) {
    case 'css-modules':
    case 'scss':
      return 'styles.colFull';
    case 'plain-css':
      return 'col-full';
    case 'tailwind':
      return 'col-span-full';
    case 'bootstrap-grid':
      return 'col-12';
    default:
      return 'col-full';
  }
}

/**
 * Generate the responsive breakpoint CSS for prototype.
 */
export function prototypeBreakpointCSS(choices: ResolvedChoices): string {
  const { tablet, desktop } = choices.breakpoints;
  const { row, column } = choices.gridGap;

  return `/* Column grids — mobile-first: all default to 1 column */
.grid-1,
.grid-2,
.grid-3,
.grid-4 { display: grid; grid-template-columns: 1fr; gap: ${row} ${column}; }
.col-full { grid-column: 1 / -1; }

/* Tablet: >=${tablet} */
@media (min-width: ${tablet}) {
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: >=${desktop} */
@media (min-width: ${desktop}) {
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
}`;
}
