// SeriesPreviewCard.tsx
import React from "react";
import { DynamicTable } from "../DynamicTable"; // adjust import path to your project
import { formatDateFromString } from "@/utils/datetime";
import { SimpleSeries } from "@/models/domain";

interface SeriesPreviewCardProps {
  series: SimpleSeries;
  onClick?: () => void;
}

export function SeriesPreviewCard({ series, onClick }: SeriesPreviewCardProps) {
  const fields = [
    series.name,
    series.email,
    series.startDate ? formatDateFromString(series.startDate) : "TBD",
    series.endDate ? formatDateFromString(series.endDate) : "TBD",
  ];

  return (
    <div
      onClick={onClick}
    >
      <DynamicTable
        items={fields}
        keyExtractor={(_, i) => i}
        renderCell={(item) => <>{item}</>}
        minCellWidth={75}
        gap={8}
        maxColumns={4}
        charPx={8}
        horizPadding={20}
        measureSampleSize={6}
      />
    </div>
  );
}
