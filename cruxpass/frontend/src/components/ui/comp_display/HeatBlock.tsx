import { DIVISION_OPTIONS, DivisionEnumMap } from "@/constants/enum";
import { Checkbox } from "../Checkbox";
import DatePicker from "react-datepicker";
import { Input } from "../Input";
import { AgeRule, CompetitionDraftState, GroupRef, HeatDraft } from "@/models/domain";
import { Button } from "../Button";
import { ArrowDown, ArrowUp } from "lucide-react";

interface Props {
  selectedGroupOptions: {
    ref: GroupRef;
    label: string;
    ageRule: AgeRule | undefined;
  }[];
  draft: CompetitionDraftState;
  heat: HeatDraft;
  showErrors: boolean;
  invalidField: string;
  updateHeat: (
    clientId: string, 
    patch: Partial<CompetitionDraftState['heats'][number]>
  ) => void;
  moveHeat: (clientId: string, direction: "up" | "down") => void;
  groupRefEquals: (a: GroupRef, b: GroupRef) => boolean;
  groupRefKey: (g: GroupRef) => string;
}

export function HeatBlock({
  selectedGroupOptions,
  draft,
  heat,
  showErrors,
  invalidField,
  updateHeat,
  moveHeat,
  groupRefEquals,
  groupRefKey
}: Props) {

  const isFirst = heat.clientId === draft.heats[0]?.clientId;
  const isLast =
    heat.clientId === draft.heats[draft.heats.length - 1]?.clientId;

  return (
    <>
      <div className="flex items-center justify-between">
        {!isFirst && (
          <Button
            disabled={isFirst}
            onClick={() => moveHeat(heat.clientId, 'up')}
          >
            <ArrowUp size={18} />
            <span className="relative top-[1px]">Move Up</span>
          </Button>
        )}

        {!isLast && (
          <Button
            disabled={isLast}
            onClick={() => moveHeat(heat.clientId, 'down')}
          >
            <ArrowDown size={18} />
            <span className="relative top-[1px]">Move Down</span>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex-1">
          <label className="font-semibold">Heat Name (Optional)</label>
          <Input
            placeholder="Name"
            className="bg-background"
            value={heat.heatName}
            onChange={e => updateHeat(heat.clientId, { heatName: e.target.value })}
          />
        </div>
          <div>
            <label className="font-semibold">Start Time</label>
            <DatePicker
              selected={heat.startTime}
              className="bg-background"
              onChange={startTime => 
              updateHeat(heat.clientId, {
                  startTime: startTime ?? null,
              })
              }
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Heat Start Time"
              customInput={<Input className={showErrors && !heat.startTime ? `${invalidField}` : ''}/>}
            />
          </div>

          <div>
            <label className="font-semibold">Duration (Minutes)</label>
            <Input
              type="number"
              placeholder="Heat Duration"
              className={showErrors && !heat.duration ? `${invalidField} bg-background` : 'bg-background'}
              step={30}
              value={heat.duration}
              onChange={e => 
                updateHeat(heat.clientId, {
                    duration: e.target.value === '' ? '' : Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="font-semibold">Capacity</label>
            <Input
              type="number"
              placeholder="Max participants"
              value={heat.capacity}
              onChange={e =>
                updateHeat(heat.clientId, {
                    capacity: e.target.value === '' ? '' : Number(e.target.value),
                })
              }
              className={showErrors && heat.capacity === '' ? `${invalidField} bg-background` : 'bg-background'}
            />
          </div>

          <div>
            <label className="font-semibold">Groups in This Heat</label>
            <div 
              className={`flex flex-wrap gap-x-4 gap-y-2 border bg-background rounded-md px-3 py-1 ${
                showErrors && heat.groups.length === 0 ? `${invalidField}` : ''}
              `}
            >
              {selectedGroupOptions.map(group => {

                const checked = heat.groups.some(g =>
                  groupRefEquals(g, group.ref)
                );

                return (
                  <label key={groupRefKey(group.ref)} className="flex items-center gap-2">
                    <Checkbox
                      className={`bg-shadow ${
                        showErrors && heat.groups.length === 0 ? `${invalidField}` : ''}
                      `}
                      checked={checked}
                      onCheckedChange={() =>
                        updateHeat(heat.clientId, {
                          groups: checked
                          ? heat.groups.filter(g => !groupRefEquals(g, group.ref))
                          : [...heat.groups, group.ref],
                        })
                      }
                    />
                    <span className="relative top-[1px]">{group.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="font-semibold">Divisions in This Heat</label>
              <div className="flex items-center">
                <button
                  type="button"
                  role="switch"
                  aria-checked={heat.divisionsEnabled}
                  onClick={() => 
                    updateHeat(heat.clientId, {
                      divisionsEnabled: !heat.divisionsEnabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 border border-green items-center rounded-full transition-colors focus:outline-none ${
                    heat.divisionsEnabled ? 'bg-green' : 'bg-background'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full border border-green bg-shadow transition-transform ${
                      heat.divisionsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          <div
            className={`flex flex-wrap space-x-5 gap-2 border px-3 py-1 rounded-md shadow-md transition-opacity ${
              heat.divisionsEnabled
                ? 'border bg-background opacity-100'
                : 'border bg-muted text-muted opacity-50 pointer-events-none'
            } ${showErrors && (heat.divisionsEnabled && heat.divisions.length === 0) ? `${invalidField}` : ''}`}
          >
            {DIVISION_OPTIONS.map(division => (
              <label key={division} className="flex items-center gap-2">
                <Checkbox
                  className={`bg-shadow ${
                    showErrors && (heat.divisionsEnabled && heat.divisions.length === 0) ? `${invalidField}` : ''}
                  `}
                  checked={heat.divisions.includes(division)}
                  onCheckedChange={(checked) =>
                    updateHeat(heat.clientId, {
                    divisions: checked
                      ? [...heat.divisions, division]
                      : heat.divisions.filter(d => d !== division),
                    })
                  }
                />
                <span className="relative top-[1px]">{DivisionEnumMap[division as keyof typeof DivisionEnumMap]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
        
      {/* HEAT WARNINGS */}
      <div className="text-sm text-accent pt-1">
        {heat.groups.some(group =>
          draft.heats.some(
            (h) => h.clientId !== heat.clientId && h.groups.includes(group)
          )
        ) && (
          <p>Warning: One or more groups appear in multiple heats.</p>
        )}

        {showErrors && (
          <>
            {heat.duration === '' && (
              <p>Duration not set</p>
            )}

            {heat.groups.length === 0 && (
              <p>No groups assigned to this heat.</p>
            )}

            {heat.divisionsEnabled && heat.divisions.length === 0 && (
              <p>Divisions enabled but no divisions assigned to this heat.</p>
            )}
          </>
        )}
      </div>
    </>
  )
}