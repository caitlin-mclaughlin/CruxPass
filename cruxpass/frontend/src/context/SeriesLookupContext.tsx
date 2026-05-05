// useSeriesLookup.ts
import { SimpleSeries } from "@/models/domain";
import { getSeriesProfile, searchSeriesByQuery } from "@/services/seriesLookupService";
import { createContext, ReactNode, useContext, useState } from "react";

interface SeriesLookupContextType {
  seriesResults: SimpleSeries[];
  seriesSearchLoading: boolean;
  searchSeries: (query: string) => Promise<void>;
  getSeriesDetails: (gymId: number) => Promise<SimpleSeries | null>;
  clearSeriesSearch: () => Promise<void>;
}

export const SeriesLookupContext = createContext<SeriesLookupContextType>({
  seriesResults: [],
  seriesSearchLoading: false,
  searchSeries: async () => {},
  getSeriesDetails: async () => null,
  clearSeriesSearch: async () => {}
});

export const SeriesLookupProvider = ({ children }: { children: ReactNode }) => {
  const [seriesResults, setResults] = useState<SimpleSeries[]>([]);
  const [seriesSearchLoading, setSeriesSearchLoading] = useState(false);

  const clearSeriesSearch = async () => {
    setResults([]);
    setSeriesSearchLoading(false);
  }

  const searchSeries = async (query: string) => {
    console.log("searching "+ query)
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setSeriesSearchLoading(true);
    try {
      const res = await searchSeriesByQuery(query);
      setResults(res);
    } catch (err) {
      console.error("Failed to search gyms:", err);
      setResults([]);
    } finally {
      setSeriesSearchLoading(false);
    }
  };

  const getSeriesDetails = async (gymId: number): Promise<SimpleSeries | null> => {
    try {
      return await getSeriesProfile(gymId);
    } catch (err) {
      console.error(`Failed to fetch gym ${gymId}`, err);
      return null;
    }
  };

  return (
    <SeriesLookupContext.Provider value={{
      seriesResults,
      seriesSearchLoading,
      searchSeries,
      getSeriesDetails,
      clearSeriesSearch
    }}>
      {children}
    </SeriesLookupContext.Provider>
  );
};

export function useSeriesLookup() {
  return useContext(SeriesLookupContext);
}