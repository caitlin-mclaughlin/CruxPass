"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/Resizable";
import { useSeriesSession } from "@/context/SeriesSessionContext";
import { formatDate, formatPhoneNumber } from "@/utils/formatters";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LinkCompetitionModal({ open, onClose, onSuccess }: Props) {
  const { series, gyms, competitions, refreshAll } = useSeriesSession();

  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);
  const [filteredComps, setFilteredComps] = useState<any[]>([]);

  useEffect(() => {
    if (selectedGymId && competitions) {
      const comps = competitions.filter((c) => c.gymId === selectedGymId);
      setFilteredComps(comps);
    }
  }, [selectedGymId, competitions]);

  const handleSelectGym = (gymId: number) => setSelectedGymId(gymId);

  const handleLink = async (competitionId: number) => {
    console.log(`Linking competition ${competitionId} to series`);
    await refreshAll();
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{`Link Competitions to ${series?.name}`}</DialogTitle>
          <DialogDescription>
            Select a gym on the left to view its competitions and choose which to link.
          </DialogDescription>
        </DialogHeader>

        {/* Split view container */}
        <ResizablePanelGroup
          direction="horizontal"
          className="border border-green rounded-md bg-shadow overflow-hidden"
        >
          {/* Left Pane – Gyms */}
          <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
            <div className="h-[400px] flex flex-col border-r border-green min-w-0">
              <h3 className="px-3 py-2 font-semibold text-green border-b border-green truncate">
                Affiliated Gyms
              </h3>

              <ScrollArea className="flex-1 min-w-0">
                <div className="p-2 space-y-2 min-w-0">
                  {/* Left Pane list item */}
                  {gyms && gyms.length > 0 ? (
                    gyms.map((gym) => (
                      <button
                        key={gym.id}
                        onClick={() => handleSelectGym(gym.id)}
                        // make each button a flex row that can shrink; min-w-0 on the button so its children can shrink
                        className={`w-full flex items-center justify-start gap-3 px-3 py-2 rounded-md border transition-colors min-w-0
                          ${selectedGymId === gym.id
                            ? "bg-green text-shadow border-green font-semibold"
                            : "bg-background text-green border-green hover:bg-highlight hover:text-background"
                          }`}
                      >
                        {/* Left content: stacked title + subtitle; allow it to shrink */}
                        <div className="flex-1 text-left min-w-0 overflow-hidden">
                          <div className="font-semibold truncate min-w-0">{gym.name}</div>
                          <div className="text-xs truncate min-w-0">{`${gym.address.city}, ${gym.address.state}`}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-green p-3">No affiliated gyms found.</div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          {/* Resizable divider */}
          <ResizableHandle className="bg-green hover:bg-green cursor-col-resize transition-colors" />

          {/* Right Pane – Competitions */}
          <ResizablePanel>
            <div className="h-[400px] flex flex-col">
              <h3 className="px-3 py-2 font-semibold text-green border-b border-green truncate">
                {selectedGymId
                  ? "Competitions at Selected Gym"
                  : "Select a gym to view competitions"}
              </h3>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2 w-full max-w-full">
                  {selectedGymId && filteredComps.length > 0 ? (
                    filteredComps.map((comp) => (
                      <div
                        key={comp.id}
                        className="flex justify-between items-center w-full max-w-full p-3 bg-shadow border border-green rounded-md hover:bg-select transition overflow-hidden"
                      >
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="font-semibold truncate">
                            {comp.name}
                          </div>
                          <div className="text-sm truncate">
                            {formatDate(comp.startDate)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleLink(comp.id)}
                          className="shrink-0 ml-3"
                        >
                          Link
                        </Button>
                      </div>
                    ))
                  ) : selectedGymId ? (
                    <div className="text-sm text-green p-1">
                      No competitions found for this gym.
                    </div>
                  ) : (
                    <div className="text-sm text-green p-1">
                      Select a gym on the left to view competitions.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DialogContent>
    </Dialog>
  );
}
