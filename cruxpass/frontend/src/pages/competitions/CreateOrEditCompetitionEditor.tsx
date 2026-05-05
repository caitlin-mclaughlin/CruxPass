import EditCompetitorModal from "@/components/modals/EditCompetitorGroupModal";
import PageContainer from "@/components/PageContainer";
import { CompetitionFormat, COMPETITION_FORMATS, CompetitionFormatMap, COMPETITION_TYPES, CompetitionTypeMap, DIVISION_OPTIONS, DivisionEnumMap } from "@/constants/enum";
import { useGymSession } from "@/context/GymSessionContext";
import { useCompetitionDraft } from "@/hooks/useCompDraft";
import { useCompetitorGroups } from "@/hooks/useCompGroups";
import { useCompetitionHeats } from "@/hooks/useCompHeats";
import { useCompetitionValidation } from "@/hooks/useCompValidation";
import { useSelectableGroups } from "@/hooks/useSelectableGroups";
import { CompetitionDraftState, PricingRuleDraft, CompetitorGroupData, GroupRef, GymData } from "@/models/domain";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { addMinutes } from "date-fns";
import { Plus, CalendarPlus, Save, Ban } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import { useNavigate, useParams } from "react-router-dom";
import { ResolvedCompetitorGroup } from "@/models/dtos";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { LoadingPage } from "@/components/ui/loading/LoadingPage";
import { GroupBlock } from "@/components/ui/comp_display/GroupBlock";
import { HeatBlock } from "@/components/ui/comp_display/HeatBlock";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import { usePricingRules } from "@/hooks/usePricingRules";
import { PriceRuleBlock } from "@/components/ui/comp_display/PriceRuleBlock";

export function CreateOrEditCompetitionEditor({ gym }: { gym: GymData }) {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const isEdit = !!competitionId;

  const {
    gymCustomGroups,
    getCompetitionById,
    createCompetition,
    updateCompetition,
    applyGroupMutationsForGym,
    refreshGymCustomGroups
  } = useGymSession();

  /** LOCAL STATE **/
  const [loadedDraft, setLoadedDraft] = useState<CompetitionDraftState>();
  const [loadingComp, setLoadingComp] = useState(isEdit);
  const [showErrors, setShowErrors] = useState(false);

  /** MODAL STATE **/
  const [editingGroup, setEditingGroup] = useState<CompetitorGroupData>();
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<CompetitorGroupData>();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  /** LOAD EXISTING COMP AND GROUPS **/
  useEffect(() => {
    if (!isEdit || !competitionId || loadedDraft) return;

    let cancelled = false;

    async function load() {
      setLoadingComp(true);
      const comp = await getCompetitionById(Number(competitionId));
      if (!cancelled && comp) {
        setLoadedDraft(mapCompetitionToDraft(comp));
      }
      if (!cancelled) {
        setLoadingComp(false);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [competitionId, isEdit, loadedDraft, getCompetitionById]);

  useEffect(() => {
    if (gym) {
      refreshGymCustomGroups();
    }
  }, [gym.id]);

  /** DRAFT **/
  const { 
    draft, setDraft, 
    competitionDraftKey,
    reconcileGroupIdsSync,
    mapCompetitionToDraft,
    mapDraftToCompetitionDto,
    mapDraftToCompetitionUpsertDto
  } = useCompetitionDraft(
    gym, 
    isEdit, 
    competitionId, 
    loadedDraft
  );

  const { 
    groupMutations,
    deleteMutationsStorageKey,
    createGroup,
    updateGroup,
    deleteGroup,
    buildMutationsPayload
  } = useGroupMutations(
    gym, 
    isEdit, 
    competitionId
  )

  /** PRICING **/
  const { createPricingRule, updatePricingRule, removePricingRule } = usePricingRules(draft.pricingRules, setDraft);

  /** GROUPS **/
  const persistentGroups: CompetitorGroupData[] = 
    gymCustomGroups.map((g: ResolvedCompetitorGroup) => ({
      ownerId: gym.id,
      clientId: `db-${g.id}`,
      constrained: g.ageRule ? true : false,
      ...g
    }))

  const { selectableGroups, groupRefEquals, groupRefKey, buildSelectedSet } =
    useSelectableGroups(persistentGroups, groupMutations);

  const selectedSet = useMemo(
    () => buildSelectedSet(draft.selectedGroups),
    [draft.selectedGroups]
  );

  const selectedGroupOptions = useMemo(() => {
    return selectableGroups.filter(g => selectedSet.has(groupRefKey(g.ref)))
  }, [selectableGroups, selectedSet]);

  const {
    unusedSelectedGroups,
    unusedSelectedGroupLabels,
    isGroupUsed,
    toggleGroup,
    removeCustomGroupFromDraft,
  } = useCompetitorGroups(
    draft,
    selectableGroups,
    setDraft,
    groupRefKey
  );

  /** HEATS **/
  const { buffer, setBuffer, createEmptyHeatDraft, updateHeat, moveHeat, removeHeat } =
    useCompetitionHeats(draft, selectedSet, setDraft, groupRefKey);

  /** VALIDATION **/
  const {
    basicInfoInvalid,
    noGroupsSelected,
    selectedGroupUnused,
    pricingInvalid,
    formInvalid
  } = useCompetitionValidation(draft, unusedSelectedGroups);

  if (!draft || loadingComp) {
    return <LoadingPage/>
  }

  /** HANDLERS **/
  function startEdit(ref: GroupRef) {
    if (ref.type !== 'CUSTOM') return;
    let group = persistentGroups.find(g => g.clientId === ref.clientId);
    if (!group) group = groupMutations.created.find(g => g.clientId === ref.clientId);
    if (!group) group = groupMutations.updated.find(g => g.clientId === ref.clientId);
    if (group) {
      setEditingGroup(group);
      setGroupModalOpen(true);
    }
  }

  async function handleSubmit() {
    if (formInvalid) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);

    let compId: number;

    const createdResults = await applyGroupMutationsForGym(buildMutationsPayload());
    const reconciledDraft = reconcileGroupIdsSync(draft, createdResults);
    if (draft.id) {
      const u = mapDraftToCompetitionDto(reconciledDraft, gym.id);
      await updateCompetition(u);
      compId = u.id;
    } else {
      compId = await createCompetition(
        mapDraftToCompetitionUpsertDto(reconciledDraft, gym.id)
      );
    }
    setDraft(reconciledDraft);
    deleteMutationsStorageKey();
    if (isEdit) localStorage.removeItem(competitionDraftKey(gym.id, draft.id));
    else localStorage.removeItem(competitionDraftKey(gym.id));

    navigate(`/competitions/${compId}`);
  }

  function handleCancel() {
    setShowErrors(false);
    
    deleteMutationsStorageKey();
    if (isEdit) {
      localStorage.removeItem(competitionDraftKey(gym.id, draft.id));
      navigate(`/competitions/${draft.id}`);
    } else {
      localStorage.removeItem(competitionDraftKey(gym.id));
      navigate('/');
    }
  }

  const toggleArrayValue = <T,>(value: T, arr: T[]): T[] =>
    arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];

  const invalidField = 'border-accent text-accent placeholder:text-accent placeholder:opacity-70';

  return (
    <PageContainer>
      <div className="flex flex-col min-h-full space-y-4">
        {/* PAGE HEADER */}
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Create Competition</h1>
          <p className="text-muted">
            Set up the basics first, then customize groups and scheduling.
          </p>
        </header>

        {/* SECTION 1: BASIC INFO */}
        <section>
          <h2 className="text-xl font-semibold border-b-2 border-green">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-2 gap-y-2 gap-x-4">
            <div >
              <label className="font-semibold">Name</label>
              <Input
                placeholder="Competition Name"
                value={draft.name}
                onChange={e => 
                  setDraft(draft => { draft.name = e.target.value })
                }
                className={showErrors && !draft.name.trim() ? `${invalidField}` : ''}
              />
            </div>

            <div>
              <label className="font-semibold">Start Date & Time</label>
              <DatePicker
                selected={draft.startDate}
                onChange={startDate =>
                  setDraft(draft => { draft.startDate = startDate ?? null })
                }
                showTimeSelect
                dateFormat="Pp"
                placeholderText="Date & Time"
                customInput={
                  <Input className={showErrors && !draft.startDate ? `${invalidField}` : ''}/>
                }
              />
            </div>

            <div>
              <label className="font-semibold">Registration Deadline</label>
              <DatePicker
                selected={draft.deadline}
                onChange={deadline =>
                  setDraft(draft => { draft.deadline = deadline ?? null })
                }
                showTimeSelect
                dateFormat="Pp"
                placeholderText="Deadline"
                customInput={
                  <Input className={showErrors && !draft.deadline ? `${invalidField}` : ''}/>
                }
              />
            </div>

            <div>
              <label className="font-semibold">Format</label>
              <Select 
                value={draft.compFormat} 
                onValueChange={(val: CompetitionFormat) => 
                  setDraft(draft => { draft.compFormat = val })
                }
              >
                <SelectTrigger className={`${showErrors && !draft.compFormat ? `${invalidField}` : ''}`}>
                  <SelectValue placeholder="Select Format" />
                </SelectTrigger>
                <SelectContent>
                  {COMPETITION_FORMATS.map(f => (
                    <SelectItem key={f} value={f}>
                      {CompetitionFormatMap[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold">Competition Types</label>
              <div 
                className={`flex flex-wrap gap-x-6 gap-y-2 border bg-shadow rounded-md shadow-md px-3 py-1 ${
                  showErrors && draft.types.length === 0 ? `${invalidField}` : ''
                }`}
              >
                {COMPETITION_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-2">
                    <Checkbox
                      className={`${showErrors && draft.types.length === 0 ? `${invalidField}` : ''}`}
                      checked={draft.types.includes(type)}
                      onCheckedChange={() =>
                        setDraft(draft => { draft.types = toggleArrayValue(type, draft.types) })
                      }
                    />
                    <span className="relative top-[1px]">{CompetitionTypeMap[type]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {showErrors && basicInfoInvalid && (
            <p className="pt-2 text-md text-accent">
              Please complete all required competition details.
            </p>
          )}
          {showErrors && pricingInvalid && (
            <p className="pt-1 text-md text-accent">
              Please provide valid pricing information for the selected pricing type.
            </p>
          )}
        </section>

        {/* SECTION 2: COMPETITOR GROUPS */}
        <section className="space-y-2 pt-2">
          <h2 className="text-xl font-semibold border-b-2 border-green">
            Competitor Groups
          </h2>

          <p className="text-muted">
            Select which groups can register for this competition. You may also add
            custom groups specific to this event.
          </p>

          {/* GROUP SELECTION */}
          <GroupBlock 
            selectableGroups={selectableGroups}
            selectedSet={selectedSet}
            draft={draft}
            customGroups={persistentGroups}
            groupMutations={groupMutations}
            showErrors={showErrors}
            noGroupsSelected={noGroupsSelected} 
            unusedSelectedGroups={unusedSelectedGroups}
            invalidField={invalidField} 
            setDraft={setDraft} 
            isGroupUsed={isGroupUsed}
            groupRefEquals={groupRefEquals}
            groupRefKey={groupRefKey} 
            startEdit={startEdit} 
            setDeletingGroup={setDeletingGroup} 
            setEditingGroup={setEditingGroup} 
            setConfirmDeleteOpen={setConfirmDeleteOpen}
            setGroupModalOpen={setGroupModalOpen}
          />

          {/* GROUP WARNINGS */}
          <div className="text-sm text-accent pt-1">
            {showErrors && (
              <>
                {noGroupsSelected && (
                  <p>At least one competitor group must be selected.</p>
                )}

                {selectedGroupUnused && (
                  <p>
                    The following group(s) have been selected but not assigned to a heat:
                    <ul className="list-disc ml-5">
                      {unusedSelectedGroupLabels.map(label => (
                        <li key={label}>{label}</li>
                      ))}
                    </ul>
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        {/* SECTION 3: PRICING INFO */}
        <section>
          <h2 className="text-xl font-semibold border-b-2 border-green">Pricing Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-2 gap-y-2 gap-x-4">
            <div>
              <label className="font-semibold">Pricing Type</label>
              <Select
                value={draft.pricingType}
                onValueChange={(val: 'FLAT' | 'BY_AGE' | 'BY_GROUP') =>
                  setDraft(draft => {
                    draft.pricingType = val;

                    if (val === 'FLAT') {
                      draft.pricingRules = [];
                      return;
                    }

                    if (draft.pricingRules.length === 0) {
                      draft.pricingRules.push(
                        createPricingRule(val === 'BY_AGE' ? 'AGE' : 'GROUP')
                      );
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Pricing Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT">Flat Fee</SelectItem>
                  <SelectItem value="BY_AGE">Fee By Age</SelectItem>
                  <SelectItem value="BY_GROUP">Fee By Competitor Group</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold">Currency</label>
              <Input
                placeholder="USD"
                value={draft.feeCurrency}
                maxLength={3}
                onChange={e =>
                  setDraft(draft => { draft.feeCurrency = e.target.value.toUpperCase() })
                }
                className={showErrors && (!draft.feeCurrency.trim() || draft.feeCurrency === '') 
                  ? `${invalidField}` : ''}
              />
            </div>

            {draft.pricingType === 'FLAT' && (
              <div>
                <label className="font-semibold">Registration Fee (Dollars)</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 35 or 35.00 for $35.00"
                  value={draft.flatFee}
                  onChange={e =>
                    setDraft(draft => {
                      draft.flatFee = e.target.value === '' ? '' : Number(e.target.value);
                    })
                  }
                  className={showErrors && pricingInvalid ? `${invalidField}` : ''}
                />
              </div>
            )}
          </div>
          {draft.pricingType !== 'FLAT' && (
            <PriceRuleBlock
              selectedGroupOptions={selectedGroupOptions}
              draft={draft}
              showErrors={showErrors}
              invalidField={invalidField}
              setDraft={setDraft}
              groupRefKey={groupRefKey}
              createPricingRule={createPricingRule}
              updatePricingRule={updatePricingRule}
              removePricingRule={removePricingRule}
            />
          )}
        </section>

        {/* SECTION 4: HEATS */}
        <section className="space-y-2 pt-2">
          <h2 className="text-xl font-semibold border-b-2 border-green">Heats & Schedule</h2>
          <p className="text-muted">
            Split the competition into time blocks and assign groups to each.
          </p>

          {/* HEAT HELPERS */}
          {draft.selectedGroups.length > 0 && draft.heats.length > 1 && (
            <div className="flex flex-wrap justify-between gap-2">
              <Button
                type="button"
                onClick={() => {
                  setDraft(draft => {
                    for (let i = 1; i < draft.heats.length; i++) {
                      const prevHeat = draft.heats[i - 1];

                      if (i === 1 && draft.startDate) {
                        draft.heats[0].startTime = draft.startDate;
                      }

                      if (prevHeat.startTime && prevHeat.duration) {
                        draft.heats[i].startTime = addMinutes(
                          prevHeat.startTime,
                          Number(prevHeat.duration) + Number(buffer)
                        );
                      }
                    }
                  });
                }}
              >
                Auto-fill start times
              </Button>
              <div className="flex items-center gap-2">
                <span>Time Between Heats (Minutes)</span>
                <Input
                  type="number"
                  className="w-13"
                  value={buffer}
                  onChange={e => setBuffer(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            {draft.heats.map((heat) => (
              <div key={heat.clientId} className="border bg-shadow rounded-md shadow-md px-3 py-2 space-y-2">
                {draft.selectedGroups.length > 0 ? (
                  <HeatBlock 
                    selectedGroupOptions={selectedGroupOptions} 
                    draft={draft} 
                    heat={heat} 
                    showErrors={showErrors} 
                    invalidField={invalidField} 
                    updateHeat={updateHeat}
                    moveHeat={moveHeat}
                    groupRefEquals={groupRefEquals} 
                    groupRefKey={groupRefKey} 
                  />
                ) : (
                  <span>Select at least one competitor group to organize heats</span>
                )}
              </div>
            ))}
          </div>

          <Button onClick={createEmptyHeatDraft}>
            <Plus size={18} />
            <span className="relative top-[1px]">Add Heat</span>
          </Button>
        </section>

        {/* FOOTER ACTIONS */}
        <div className="mt-auto"></div>
        <footer className="pt-4 border-t-2 border-green">
          <div className="flex justify-between">
            <Button
              className="bg-accent hover:bg-accentHighlight"
              onClick={handleCancel}
            >
              <Ban size={18} />
              <span className="relative top-[1px]">Cancel</span>
            </Button>
            <Button
              onClick={handleSubmit}
            >
              {isEdit ? (
                <>
                  <Save size={18} />
                  <span className="relative top-[1px]">Save Competition</span>
                </>
              ) : (
                <>
                  <CalendarPlus size={18} />
                  <span className="relative top-[1px]">Create Competition</span>
                </>
              )}
            </Button>
          </div>
        </footer>
      </div>
      
      {gym && (
        <EditCompetitorModal
          open={groupModalOpen}
          group={editingGroup} // undefined = add
          ownerId={gym.id}
          onClose={() => {
            setEditingGroup(undefined);
            setGroupModalOpen(false);
          }}
          onSave={(payload) => {
            if ('id' in payload && payload.id) updateGroup(payload);
            else createGroup(payload);
            setEditingGroup(undefined);
            setGroupModalOpen(false);
            setDraft(draft => {
              draft.selectedGroups.push({
                type: 'CUSTOM',
                clientId: payload.clientId
              });
            });
          }}
        />
      )}
      {deletingGroup && (
        <ConfirmModal
          open={confirmDeleteOpen}
          title="Delete custom competitor group?"
          description={`The ${deletingGroup.name} group will no longer be selectable for future competitions. Past competitions will remain unchanged.`}
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={() =>  {
            removeCustomGroupFromDraft(deletingGroup.clientId);
            deleteGroup(deletingGroup);
            setDeletingGroup(undefined);
            setConfirmDeleteOpen(false);
          }}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      )}


    </PageContainer>
  );
}
