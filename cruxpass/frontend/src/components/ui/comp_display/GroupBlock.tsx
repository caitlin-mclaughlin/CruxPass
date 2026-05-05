import { ParseAgeRule, getMutatableGroupFromRef } from "@/models/compHelpers";
import { Checkbox } from "../Checkbox";
import { AgeRule, CompetitionDraftState, CompetitorGroupData, GroupMutationsData, GroupRef } from "@/models/domain";
import { Button } from "../Button";
import { Plus } from "lucide-react";
import { Updater } from "use-immer";

interface Props {
  selectableGroups: {
    ref: GroupRef;
    label: string;
    ageRule: AgeRule | undefined;
  }[];
  selectedSet: Set<string>,
  draft: CompetitionDraftState;
  editingGroup?: CompetitorGroupData;
  customGroups: CompetitorGroupData[];
  groupMutations: GroupMutationsData;
  showErrors: boolean;
  noGroupsSelected: boolean;
  unusedSelectedGroups: GroupRef[];
  invalidField: string;
  setDraft: Updater<CompetitionDraftState>;
  isGroupUsed: (ref: GroupRef) => boolean;
  groupRefEquals: (a: GroupRef, b: GroupRef) => boolean;
  groupRefKey: (g: GroupRef) => string;
  startEdit: (ref: GroupRef) => void;
  setDeletingGroup: React.Dispatch<React.SetStateAction<CompetitorGroupData | undefined>>;
  setEditingGroup: React.Dispatch<React.SetStateAction<CompetitorGroupData | undefined>>;
  setConfirmDeleteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setGroupModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export function GroupBlock({
  selectableGroups,
  selectedSet,
  draft,
  editingGroup,
  customGroups,
  groupMutations,
  showErrors,
  noGroupsSelected,
  unusedSelectedGroups,
  invalidField,
  setDraft,
  isGroupUsed,
  groupRefEquals,
  groupRefKey,
  startEdit,
  setDeletingGroup,
  setEditingGroup,
  setConfirmDeleteOpen,
  setGroupModalOpen
}: Props) {
  return (
    <>
      <div className={`grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-y-2 gap-x-3 border bg-shadow rounded-md shadow-md px-3 py-2 ${
          showErrors && (noGroupsSelected || unusedSelectedGroups) ? `${invalidField}` : ''
      }`}>
        {selectableGroups.map(group => {
          const isEditing = 
            editingGroup &&
            group.ref.type === 'CUSTOM' &&
            editingGroup.clientId === group.ref.clientId;

          return (
            <div
              key={groupRefKey(group.ref)}
              className={`flex items-center gap-2 ${
                  isGroupUsed(group.ref) ? 'opacity-70' : ''
              }`}
            >
              <label className="space-x-2">
                <Checkbox
                  disabled={isGroupUsed(group.ref)}
                  checked={selectedSet.has(groupRefKey(group.ref))}
                  onCheckedChange={() => {
                    if (isGroupUsed(group.ref)) return;

                    setDraft(draft => {
                      const exists = selectedSet.has(groupRefKey(group.ref));

                      if (exists) {
                        draft.selectedGroups = draft.selectedGroups.filter(
                          g => !groupRefEquals(g, group.ref)
                        );
                      } else {
                        draft.selectedGroups.push(group.ref);
                      }
                    });
                  }}
                />
                    
                <span>{group.label}</span>
                {group.ageRule && (
                  <span className="text-xs text-muted">{`(${ParseAgeRule(group.ageRule)})`}</span>
                )}
              </label>

              {/* ACTIONS */}
              {group.ref.type === 'CUSTOM' && !isEditing && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className={`relative top-[1px] border-b text-xs hover:text-select hover:border-select ${
                      isGroupUsed(group.ref)
                        ? 'cursor-not-allowed'
                        : 'hover:text-accentHighlight hover:border-accentHighlight'
                    }`}
                    disabled={isGroupUsed(group.ref)}
                    onClick={() => startEdit(group.ref)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className={`text-xs relative border-b border-accent top-[1px] ${
                      isGroupUsed(group.ref)
                        ? 'cursor-not-allowed'
                        : 'text-accent hover:text-accentHighlight hover:border-accentHighlight'
                    }`}
                    disabled={isGroupUsed(group.ref)}
                    onClick={() => {
                      if (isGroupUsed(group.ref)) return;
                      if (group.ref.type !== 'CUSTOM') return;

                      const deletable = getMutatableGroupFromRef(group.ref, customGroups, groupMutations);
                      if (!deletable) return;

                      setDeletingGroup(deletable);
                      setConfirmDeleteOpen(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD CUSTOM GROUP */}
      <Button
        type="button"
        onClick={() => {
          setEditingGroup(undefined)
          setGroupModalOpen(true)
        }}
      >
        <Plus size={18} />
        <span className="relative top-[1px]">Add Custom Group</span>
      </Button>
    </>
  )
}