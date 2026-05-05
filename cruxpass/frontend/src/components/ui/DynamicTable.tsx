// DynamicTable.tsx
import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DynamicTableProps<T = string> {
  items: T[]; // strings (or objects if textForEstimate provided)
  keyExtractor: (item: T, index: number) => string | number;
  renderCell: (item: T, index: number) => React.ReactNode;
  minCellWidth?: number;      // px minimum for a cell
  gap?: number;               // px horizontal gap between cells
  maxColumns?: number;        // maximum columns to attempt
  charPx?: number;            // approximate px per character for estimate
  horizPadding?: number;      // left+right padding estimate per-cell (px)
  measureSampleSize?: number; // how many longest items to actually measure in DOM (small number)
  textForEstimate?: (item: T) => string; // optional accessor if items aren't raw strings
}

export function DynamicTable<T = string>({
  items,
  keyExtractor,
  renderCell,
  minCellWidth = 120,
  gap = 8,
  maxColumns = 4,
  charPx = 8,
  horizPadding = 16,
  measureSampleSize = 6,
  textForEstimate,
}: DynamicTableProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chosenCols, setChosenCols] = useState<number>(1);
  const estWidthsRef = useRef<number[] | null>(null); // cached estimates / measured
  const measuredOnceRef = useRef(false);

  // helper: get string for estimating width
  const textOf = (it: T) => {
    if (textForEstimate) return textForEstimate(it) ?? "";
    return (it as unknown as string) ?? "";
  };

  // quick char-count estimate per item
  const estimateWidths = (): number[] => {
    const arr = items.map((it) => {
      const s = textOf(it) ?? "";
      const len = s.length;
      const est = Math.max(minCellWidth, Math.ceil(len * charPx + horizPadding));
      return est;
    });
    estWidthsRef.current = arr;
    return arr;
  };

  // DOM-measure (fallback) for top-N longest items. returns partial widths merged into estWidthsRef.
  const measureLongestItemsInDom = (): number[] => {
    // guard
    if (!items || items.length === 0) return [];

    // create ephemeral container
    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.visibility = "hidden";
    wrapper.style.left = "-9999px";
    wrapper.style.top = "-9999px";
    wrapper.style.whiteSpace = "nowrap";
    document.body.appendChild(wrapper);

    try {
      // choose top-k by estimated length
      const textPairs = items.map((it, idx) => ({ idx, text: textOf(it) ?? "" }));
      textPairs.sort((a, b) => b.text.length - a.text.length);
      const sample = textPairs.slice(0, Math.min(measureSampleSize, textPairs.length));

      const measured: Record<number, number> = {};
      for (const s of sample) {
        const span = document.createElement("span");
        // apply the same utility classes your UI uses can help; we won't replicate Tailwind here,
        // but we make a reasonable measurement using default font metrics.
        span.textContent = s.text || " "; // single space if empty
        wrapper.appendChild(span);
        const w = Math.ceil(span.getBoundingClientRect().width) + horizPadding;
        measured[s.idx] = Math.max(minCellWidth, w);
        wrapper.removeChild(span);
      }

      // merge into estimates
      const est = estWidthsRef.current ?? estimateWidths();
      Object.entries(measured).forEach(([k, v]) => {
        est[Number(k)] = Math.max(est[Number(k)], Number(v));
      });
      estWidthsRef.current = est;
      measuredOnceRef.current = true;
      return est;
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  // Balanced rows builder (identical to your rule)
  const buildBalancedRows = (nItems: number, cols: number): T[][] => {
    const R = Math.ceil(nItems / cols);
    const base = Math.floor(nItems / R);
    const remainder = nItems % R;
    const rows: T[][] = [];
    let idx = 0;
    for (let r = 0; r < R; r++) {
      const size = r < remainder ? base + 1 : base;
      rows.push(items.slice(idx, idx + size));
      idx += size;
    }
    return rows;
  };

  // compute column widths given rows & estWidths
  const computeColWidthsFromRows = (rows: T[][], estWidths: number[]): number[] => {
    if (rows.length === 1) {
      // single-row -> widths in order for that row
      return rows[0].map((_, i) => estWidths[i] ?? minCellWidth);
    }
    const maxCols = Math.max(...rows.map((r) => r.length));
    const colWidths = new Array(maxCols).fill(minCellWidth);
    let globalIndex = 0;
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        const w = (estWidths[globalIndex] ?? minCellWidth) + 2;
        if (w > colWidths[c]) colWidths[c] = w;
        globalIndex++;
      }
    }
    return colWidths;
  };

  // choose largest column count that fits
  const chooseColumns = () => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth || container.getBoundingClientRect().width;
    const N = items.length;
    if (!width || N === 0) {
      setChosenCols(1);
      return;
    }

    // ensure we have estimates
    const est = estWidthsRef.current ?? estimateWidths();

    // measure a few longest ones if not yet measured (one-time) — helps avoid bad estimates
    if (!measuredOnceRef.current && measureSampleSize > 0) {
      // measure only if there's a chance estimates are inaccurate — i.e. some items long enough
      // We'll just always do the sample measurement once, because it's cheap for small sample sizes.
      measureLongestItemsInDom();
    }

    const finalEst = estWidthsRef.current ?? est;

    const maxTry = Math.min(maxColumns, N);
    for (let cols = maxTry; cols >= 1; cols--) {
      const rows = buildBalancedRows(N, cols);
      const colWidths = computeColWidthsFromRows(rows, finalEst);
      const displayCols = colWidths.length;
      const totalGaps = Math.max(0, displayCols - 1) * gap;
      const totalNeeded = colWidths.reduce((s, w) => s + w, 0) + totalGaps;
      if (totalNeeded <= width) {
        setChosenCols(cols);
        return;
      }
    }
    setChosenCols(1);
  };

  useLayoutEffect(() => {
    // reset on items change
    estWidthsRef.current = null;
    measuredOnceRef.current = false;
    chooseColumns();

    const ro = new ResizeObserver(() => chooseColumns());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", chooseColumns);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", chooseColumns);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, minCellWidth, gap, maxColumns, charPx, horizPadding, measureSampleSize]);

  if (!items || items.length === 0) return null;

  // final rows & column widths
  const finalRows = buildBalancedRows(items.length, chosenCols);
  const estWidths = estWidthsRef.current ?? estimateWidths();
  const finalColWidths = computeColWidthsFromRows(finalRows, estWidths);

  // helper to compute global index for rendering
  const globalIndexFor = (rowIndex: number, colIndex: number) => {
    let idx = 0;
    for (let r = 0; r < rowIndex; r++) idx += finalRows[r].length;
    return idx + colIndex;
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="rounded-md bg-shadow border border-green overflow-hidden">
        {finalRows.map((row, rowIndex) => {
          const isFirstRow = rowIndex === 0;
          const isLastRow = rowIndex === finalRows.length - 1;

          return (
            <div key={rowIndex} className="flex w-full min-w-0">
              {row.map((item, colIndex) => {
                const isFirstCol = colIndex === 0;
                const isLastCol = colIndex === row.length - 1;
                const globalIndex = globalIndexFor(rowIndex, colIndex);

                const widthPx =
                  finalRows.length === 1
                    ? estWidths[globalIndex] + 3
                    : finalColWidths[colIndex] ?? minCellWidth;

                return (
                  <div
                    key={keyExtractor(item, globalIndex)}
                    style={{
                      width: `${widthPx}px`,
                      minWidth: 0,
                    }}
                    className={cn(
                      "px-2 py-2 overflow-hidden whitespace-nowrap flex-grow justify-center items-center",
                      // internal separators only
                      !isFirstRow && "border-t border-green/40",
                      !isLastRow && "border-b border-green/40",
                      !isFirstCol && "border-l border-green/40",
                      !isLastCol && "border-r border-green/40"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-center">{renderCell(item, globalIndex)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
