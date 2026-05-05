import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Ban, Save } from "lucide-react"
import CustomRadioGroup from "@/components/ui/CustomRadioGroup"
import { AGE_TYPE_OPTIONS } from "@/models/compHelpers"
import { CompetitorGroupData } from "@/models/domain"
import { useCompetitorGroupDraft } from "@/hooks/useCompGroupDraft"

interface Props {
  open: boolean
  group?: CompetitorGroupData // undefined = create
  ownerId: number
  onClose: () => void
  onSave: (payload: CompetitorGroupData) => void
}

export default function EditCompetitorGroupModal({
  open,
  group,
  ownerId,
  onClose,
  onSave
}: Props) {

  const {
    name, setName,
    constrained, setConstrained,
    ageType, setAgeType,
    min, setMin,
    max, setMax,
    isEdit,
    canSave,
    isInvalidRange,
    isDirty,
    hasMixedTypes,
    buildPayload,
  } = useCompetitorGroupDraft(group, ownerId)

  function handleSave() {
    if (!isDirty) onClose();
    if (!canSave) return;

    onSave(buildPayload());
  }

  // ---------- RENDER ----------
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit Group` : `Add Custom Group`}
          </DialogTitle>
          <DialogDescription>
            Define your custom group.
          </DialogDescription>
        </DialogHeader>

        {/* NAME */}
        <Input
          placeholder="Group Name (e.g. Youth U14)"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        {/* AGE TOGGLE */}
        <div className="flex justify-between items-center pt-2">
          <label className="font-semibold">Restrict Group By Age</label>
          <button
            type="button"
            role="switch"
            aria-checked={constrained}
            onClick={() => {
              if (constrained) {
                setMin("")
                setMax("")
              }
              setConstrained(!constrained)
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
              constrained ? "bg-green border-green" : "bg-shadow border-green"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-background border border-green transition-transform ${
                constrained ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className={`bg-shadow border rounded-md shadow-md px-3 py-2 space-y-2 transition-opacity ${
          constrained
            ? 'border-green bg-background opacity-100'
            : 'border-border bg-muted text-muted opacity-50 pointer-events-none'
        }`}>
          {/* AGE TYPE */}
          <CustomRadioGroup
            name="group-age-type"
            options={AGE_TYPE_OPTIONS}
            selected={ageType}
            onChange={setAgeType}
            orientation="horizontal"
          />

          {/* MIN / MAX */}
          <div className="flex gap-4">
            <Input
              className="bg-background"
              type="number"
              placeholder={ageType === "AGE" ? "Min Age" : "Earliest Year"}
              value={min}
              onChange={e => setMin(e.target.value)}
            />
            <Input
              className="bg-background"
              type="number"
              placeholder={ageType === "AGE" ? "Max Age" : "Latest Year"}
              value={max}
              onChange={e => setMax(e.target.value)}
            />
          </div>

          {!isInvalidRange && !hasMixedTypes && (min || max) && (
            <>
              {ageType === 'AGE' ? (
                <>
                  {/* Age constraint based on age */}
                  {min && max ? (
                    <>
                      {/* Min and Max are both defined */}
                      {min === max ? (
                        <p>{`Climbers must be ${min} years old to participate in this group`}</p>
                      ) : (
                        <p>{`Climbers must be ${min}-${max} years old to participate in this group`}</p>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Min or Max is defined */}
                      {min ? (
                        <p>{`Climbers must be at least ${min} years old to participate in this group`}</p>
                      ) : (
                        <p>{`Climbers must be ${max} years old or younger to participate in this group`}</p>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Age constraint based on birth year */}
                  {min && max ? (
                    <>
                      {/* Min and Max are both defined */}
                      {min === max ? (
                        <p>{`Climbers must be born in ${min} to participate in this group`}</p>
                      ) : (
                        <p>{`Climbers must be born in ${min}-${max} to participate in this group`}</p>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Min or Max is defined */}
                      {min ? (
                        <p>{`Climbers must be born in ${min} or later to participate in this group`}</p>
                      ) : (
                        <p>{`Climbers must be born in ${max} or earlier to participate in this group`}</p>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* WARNINGS */}
        {isInvalidRange && (
          <p className="text-sm text-accent">
            Minimum cannot be greater than maximum.
          </p>
        )}
        {hasMixedTypes && (
          <>
          {ageType === 'AGE' ? (
            <p className="text-sm text-accent">
              Invalid age provided.
            </p>
          ) : (
            <p className="text-sm text-accent">
              Invalid birth year provided.
            </p>
          )}
          </>
        )}

        {/* FOOTER */}
        <DialogFooter>
          <Button
            className="bg-accent hover:bg-accentHighlight text-background"
            onClick={onClose}
          >
            <Ban size={18} />
            <span className="relative top-[1px]">Cancel</span>
          </Button>

          <Button disabled={!canSave} onClick={handleSave}>
            <Save size={18} />
            <span className="relative top-[1px]">
              {isEdit ? "Save Changes" : "Add Group"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
