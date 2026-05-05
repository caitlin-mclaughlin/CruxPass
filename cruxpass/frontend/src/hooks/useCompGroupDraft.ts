import { useEffect, useMemo, useState } from "react"
import { AgeRuleType } from "@/constants/enum"
import { CompetitorGroupData } from "@/models/domain"

export function useCompetitorGroupDraft(
  group: CompetitorGroupData | undefined,
  ownerId: number | undefined,
) {
  const isEdit = !!group

  // ---------- STATE ----------
  const [name, setName] = useState("")
  const [clientId, setClientId] = useState("")
  const [constrained, setConstrained] = useState(false)
  const [ageType, setAgeType] = useState<AgeRuleType>("AGE")
  const [min, setMin] = useState("")
  const [max, setMax] = useState("")

  // ---------- INIT ----------
  useEffect(() => {
    if (!group) {
      setName("");
      setClientId(crypto.randomUUID());
      setConstrained(false);
      setAgeType("AGE");
      setMin("");
      setMax("");
      return;
    }

    setName(group.name)
    setClientId(group.clientId)

    if (group.ageRule) {
      setConstrained(true);
      setAgeType(group.ageRule.type);
      setMin(group.ageRule.min?.toString() ?? "");
      setMax(group.ageRule.max?.toString() ?? "");
    } else {
      setConstrained(false)
      setMin("")
      setMax("")
    }
  }, [group?.clientId])

  // ---------- VALIDATION ----------
  const minNum = useMemo(() => (min === "" ? undefined : Number(min)), [min])
  const maxNum = useMemo(() => (max === "" ? undefined : Number(max)), [max])

  const isInvalidRange =
    minNum !== undefined &&
    maxNum !== undefined &&
    minNum > maxNum

  const hasMixedTypes =
    ageType === 'AGE'
      ? (minNum !== undefined && minNum > 100) ||
        (maxNum !== undefined && maxNum > 100)
      : (minNum !== undefined && minNum < 1925) ||
        (maxNum !== undefined && maxNum < 1925)

  const isDirty =
    name !== group?.name ||
    constrained !== !!group?.ageRule ||
    min !== (group?.ageRule?.min?.toString() ?? "") ||
    max !== (group?.ageRule?.max?.toString() ?? "")

  const canSave =
    !!ownerId &&
    name.trim().length > 0 &&
    !isInvalidRange &&
    !hasMixedTypes

  // ---------- PAYLOAD ----------
  function buildPayload(): CompetitorGroupData {
    return {
      id: group?.id,
      ownerId: ownerId!,
      clientId: clientId,
      name: name.trim(),
      constrained: constrained,
      ageRule:
        constrained && (minNum || maxNum)
          ? { type: ageType, min: minNum, max: maxNum }
          : undefined,
    };
  }

  return {
    // state
    name, setName,
    constrained, setConstrained,
    ageType, setAgeType,
    min, setMin,
    max, setMax,

    // derived
    isEdit,
    canSave,
    isDirty,
    isInvalidRange,
    hasMixedTypes,

    // actions
    buildPayload,
  }
}
