import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { SearchType, SearchTypeDisplay } from '@/constants/enum'
import { Button } from '@/components/ui/Button'
import { SimpleGym, SimpleSeries } from '@/models/domain'
import { EnumSelect } from '../ui/EnumSelect'
import { SearchResults } from '../ui/SearchResults'
import { Input } from '../ui/Input'
import { Search } from 'lucide-react'
import { useSeriesSession } from '@/context/SeriesSessionContext'
import { useGymLookup } from '@/context/GymLookupContext'
import { formatPhoneNumber } from '@/utils/formatters'
import { useGymSession } from '@/context/GymSessionContext'
import { useSeriesLookup } from '@/context/SeriesLookupContext'
import { GymPreviewCard } from '../ui/cards/GymPreviewCard'
import { SeriesPreviewCard } from '../ui/cards/SeriesPreviewCard'

type LinkMode = "series-selects-gym" | "gym-selects-series";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: LinkMode;
}


export default function LinkGymSeriesModal({ open, onClose, onSuccess, mode }: Props) {
  const [selectedEntity, setSelectedEntity] = useState<SimpleGym | SimpleSeries | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Gym-specific state
  const searchRef = useRef<HTMLDivElement>(null)
  const [showResults, setShowResults] = useState(false)
  const [searchMode, setSearchMode] = useState<SearchType>(SearchType.NAME)
  const [searchQuery, setSearchQuery] = useState('')

  // Series mode objects
  const isSeriesMode = mode === "series-selects-gym";
  const { series, gyms, refreshSeries, addGym } = useSeriesSession()
  const { gymResults, gymSearchLoading, searchGyms, clearGymsSearch } = useGymLookup()
  const affiliatedGymIds = gyms?.map(g => g.id) ?? []

  // Gym mode objects
  const isGymMode = mode === "gym-selects-series"
  const { gym, gymSeries, refreshGym, addSeries } = useGymSession()
  const { seriesResults, seriesSearchLoading, searchSeries, clearSeriesSearch } = useSeriesLookup()
  const affiliatedSeriesIds = gymSeries?.map(s => s.id) ?? []

  const loading = isSeriesMode ? gymSearchLoading : seriesSearchLoading;
  const entities = isSeriesMode ? gymResults : seriesResults;
  const selectedId = selectedEntity?.id ?? null;
  const alreadyLinkedIds = isSeriesMode
    ? affiliatedGymIds
    : affiliatedSeriesIds;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      // Wait for dialog to mount fully before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [open]);

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setError(prev => (prev ? null : prev));

    if (isSeriesMode) {
      await searchGyms(`${searchMode}:${searchQuery.trim()}`);
    } else {
      console.log("searching here")
      await searchSeries(`${searchMode}:${searchQuery.trim()}`);
    }
  }

  // When a gym selects a climber, fetch dependents if they exist
  const handleSelect = (id: number) => {
    const found = entities.find(e => e.id === id);
    if (!found) return;

    // prevent duplicate links
    if (alreadyLinkedIds.includes(id)) {
      setError("This gym is already affiliated with this series.");
      setShowResults(false);
      return;
    }

    setSelectedEntity(found);
    setShowResults(false);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedEntity) {
        setError(isSeriesMode
          ? "Please select a gym."
          : "Please select a series."
        );
        return;
      }

      if (isSeriesMode) {
        await addGym(selectedEntity.id);
      } else {
        await addSeries(selectedEntity.id);
      }

      onSuccess();
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Linking failed.");
    }
  };

  const handleClose = () => {
    setSelectedEntity(null)
    setSearchQuery('')
    clearGymsSearch()
    clearSeriesSearch()
    setError(null)
    onClose()
  }

  const refresh = async () => {
    await refreshSeries()
  }

  useEffect(() => {
    if (open) {
      refresh()
      if ((series && !isSeriesMode) || (gym && !isGymMode)) handleClose()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isSeriesMode
              ? `Affiliate a Gym with ${series?.name}`
              : `Affiliate ${gym?.name} with a Series`}
          </DialogTitle>
          <DialogDescription>
            {isSeriesMode
              ? "Find a gym by name, email, or phone to link it to your series."
              : "Find a series by name or email to link it to your gym."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-green">
          <div className="space-y-3" ref={searchRef}>
            <div className="space-y-1">
              <div className="flex gap-2">
                <EnumSelect
                  labelMap={SearchTypeDisplay}
                  options={Object.values(SearchType)}
                  value={searchMode}
                  onChange={(val: SearchType) => {
                    setShowResults(false)
                    setSearchMode(val)
                  }}
                  onOpen={(isOpen) => {
                    if (isOpen) setShowResults(false)
                  }}
                  className="flex-1 w-fit"
                />
                <Input
                  ref={inputRef}
                  type="text"
                  className="min-w-20"
                  value={searchQuery}
                  onChange={(e) => {
                    setShowResults(true)
                    setSearchQuery(e.target.value)
                  }}
                  placeholder={`Search by ${searchMode}`}
                  onFocus={() => {
                    if (searchQuery) setShowResults(true)
                  }} // show when focused
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      await handleSearch()
                      setShowResults(true)
                    }
                  }}
                />
                <Button
                  onClick={async () => {
                    await handleSearch()
                    setShowResults(true)
                  }}
                  disabled={loading}
                >
                  <Search size={18} />
                  <span className="relative top-[1px]">{loading ? 'Searching...' : 'Search'}</span>
                </Button>
              </div>

              {showResults && (
                isSeriesMode ? (
                  <SearchResults
                    mode={"gym"}
                    results={entities as SimpleGym[]}
                    selectedId={selectedId}
                    affiliatedIds={alreadyLinkedIds}
                    onSelect={handleSelect}
                    loading={loading}
                  />
                ) : (
                  <SearchResults
                    mode="series"
                    results={entities as SimpleSeries[]}
                    selectedId={selectedId}
                    affiliatedIds={alreadyLinkedIds}
                    onSelect={handleSelect}
                    loading={seriesSearchLoading}
                  />
                )
              )}
            </div>

            {/* Selected gym info (persistent after dropdown closes) */}
            {selectedEntity && (
              isSeriesMode ? (
                <GymPreviewCard gym={selectedEntity as SimpleGym} />
              ) : (
                <SeriesPreviewCard series={selectedEntity as SimpleSeries} />
              )
            )}
          </div>

          {error && <div className="text-accent mt-2">{error}</div>}

          <Button 
            onClick={handleSubmit}
            className={'w-full mt-1'}
            disabled={!selectedEntity}
          >
            {selectedEntity
              ? isSeriesMode
                // series is linking a gym
                ? `Link ${selectedEntity.name} to ${series?.name}`
                // gym is linking a series
                : `Link ${gym?.name} to ${selectedEntity.name}`
              : isSeriesMode
                // no entity selected & series→gyms
                ? `Select a Gym to Link to ${series?.name}`
                // no entity selected & gyms→series
                : `Select a Series to Link to ${gym?.name}`
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
