import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { updateSeries } from "@/services/seriesService"
import SegmentedDateInput from "../ui/SegmentedDateInput"

export default function SeriesOnboardingModal({ series, open, onClose }: {
  series: any,
  open: boolean,
  onClose: () => void
}) {
  const [form, setForm] = useState({
    description: series?.description ?? "",
    startDate: series?.startDate ?? "",
    endDate: series?.endDate ?? "",
    deadline: series?.deadline ?? ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: Date | null) => {
    setForm((prev) => ({ ...prev, [name]: date }))
  }

  const handleSave = async () => {
    try {
      await updateSeries(form)
      onClose()
    } catch (err) {
      console.error("Failed to update series:", err)
      alert("Could not save series details.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Your series is almost ready!</DialogTitle>
          <DialogDescription>
            We just need a bit more information before your series can go live.
          </DialogDescription>
        </DialogHeader>

        <div>
          <label className="font-semibold">Series Description (Optional)</label>
          <Textarea
            name="description"
            placeholder="Your description"
            value={form.description}
            onChange={handleChange}
          />
          <div className="flex gap-4 mt-4 w-full">
            <label className="flex-1 font-semibold">Start Date</label>
            <label className="flex-1 font-semibold">End Date</label>
            <label className="flex-1 font-semibold">Deadline</label>
          </div>
          <div className="flex gap-4 w-full">
            <div className="w-full flex-1 bg-shadow border rounded-md shadow-md">
              <SegmentedDateInput
                mode="generic"
                value={form.startDate}
                onChange={(date) => handleDateChange("startDate", date)}
              />
            </div>
            <div className="w-full flex-1 bg-shadow border rounded-md shadow-md">
              <SegmentedDateInput
                mode="generic"
                value={form.endDate}
                onChange={(date) => handleDateChange("endDate", date)}
                minDate={form.startDate ?? undefined}
              />
            </div>
            <div className="w-full flex-1 bg-shadow border rounded-md shadow-md">
              <SegmentedDateInput
                mode="generic"
                value={form.deadline}
                onChange={(date) => handleDateChange("deadline", date)}
                maxDate={form.endDate ?? undefined}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button className="bg-accent text-background" onClick={onClose}>
            Skip for Now
          </Button>
          <Button onClick={handleSave}>
            Save & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
