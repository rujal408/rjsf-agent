/**
 * Returns a CSS `gridTemplateColumns` value that is responsive:
 * - On narrow screens: collapses to 1 column
 * - On medium screens: 2 columns
 * - On wide screens: up to `maxCols` columns
 *
 * Uses `auto-fit` + `minmax(min(100%, Xpx), 1fr)` so no media queries are needed.
 * The min-width per column is calculated to allow exactly `maxCols` in a ~900px container.
 */
export function responsiveGridColumns(maxCols: number): string {
  if (maxCols <= 1) return '1fr';

  // Min width per column so that `maxCols` columns fit in ~880px (card content width)
  // 880 / maxCols - gap(24px) gives approximate min. We use slightly smaller values
  // so columns appear before the container is completely full.
  const minWidthMap: Record<number, number> = {
    2: 280,  // 2 cols at >=560px
    3: 200,  // 3 cols at >=600px
    4: 160,  // 4 cols at >=640px
  };

  const minWidth = minWidthMap[maxCols] ?? Math.floor(800 / maxCols);
  return `repeat(auto-fit, minmax(min(100%, ${minWidth}px), 1fr))`;
}
