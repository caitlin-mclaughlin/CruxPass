import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import SegmentedDateInput from "../ui/SegmentedDateInput"
import DatePicker from "react-datepicker"
import { useIsMobile } from "@/hooks/isMobile"
import { Input } from "../ui/Input"
import { Ban, Calendar, Save } from "lucide-react"
import { SeriesData } from "@/models/domain"
import { makeDateChangeHandler, normalizeBackendDateOrDateTime } from "@/utils/datetime"
import { useSeriesSession } from "@/context/SeriesSessionContext"

export default function SeriesOnboardingModal({ open, onClose }: {
  open: boolean,
  onClose: () => void
}) {
  const { series, updateSeriesProfile } = useSeriesSession()

  const [form, setForm] = useState<Partial<SeriesData>>({
    description: series?.description ?? "",
    startDate: series?.startDate ?? "",
    endDate: series?.endDate ?? "",
    deadline: series?.deadline ?? ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      await updateSeriesProfile(form)
      onClose()
    } catch (err) {
      console.error("Failed to update series:", err)
      alert("Could not save series details.")
    }
  }

  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Your series is almost ready!</DialogTitle>
          <DialogDescription>
            We just need a bit more information before your series can go live.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1">
          <span className="font-semibold">Series Description (Optional)</span>
          <Textarea
            name="description"
            placeholder="Your description"
            value={form.description}
            onChange={handleChange}
          />
          <div className="flex gap-2 mt-1 w-full">
            <span className="flex-3 font-semibold">Start Date</span>
            <span className="flex-3 font-semibold">End Date</span>
            <span className="flex-4 font-semibold">Deadline</span>
          </div>
          <div className="flex gap-2 w-full">
            <div className="flex-3 bg-shadow rounded-md">
              <SegmentedDateInput
                mode="generic"
                value={form.startDate}
                onChange={makeDateChangeHandler<Partial<SeriesData>>("startDate", setForm, "date")}
              />
            </div>
            <div className="flex-3 bg-shadow rounded-md">
              <SegmentedDateInput
                mode="generic"
                value={form.endDate}
                onChange={makeDateChangeHandler<Partial<SeriesData>>("endDate", setForm, "date")}
                minDate={normalizeBackendDateOrDateTime(form.startDate ?? "") ?? undefined}
              />
            </div>
            <div className="flex-4 bg-shadow rounded-md">
              <DatePicker
                selected={normalizeBackendDateOrDateTime(form.deadline ?? null)}
                onChange={makeDateChangeHandler<Partial<SeriesData>>("deadline", setForm, "datetime")}
                showTimeSelect={true}
                dateFormat="Pp"
                placeholderText="MM/DD/YYYY, hh:mm"
                customInput={<Input />}
                popperPlacement="bottom-start"
                portalId={isMobile ? "datepicker-portal" : undefined}
                popperClassName="z-[9999]"
                popperContainer={(props) => <div {...props} />}
              />
              <Calendar className="absolute right-1/18 top-2/3 focus-visible:outline-none" size={18} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button className="bg-accent hover:bg-accentHighlight text-background" onClick={onClose}>
            <Ban size={18} />
            <span className="relative top-[1px]">Skip for Now</span>
          </Button>
          <Button onClick={handleSave}>
            <Save size={18} />
            <span className="relative top-[1px]">Save & Continue</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
