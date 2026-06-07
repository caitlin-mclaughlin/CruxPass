import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { BOULDER_GRADE, BoulderGrade, BoulderGradeMap } from "@/constants/enum";
import { RouteDto } from "@/models/dtos";
import { Route } from "@/models/domain";
import { SortableRouteRow } from "@/components/ui/SortableRouteRow";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Modifier } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, Minus, Pencil, Plus, RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type RouteDraft = {
  clientId: string;
  grade: BoulderGrade;
  pointValue: number | null;
}

const restrictRouteDrag: Modifier = ({
  activeNodeRect,
  containerNodeRect,
  transform,
}) => {
  const nextTransform = {
    ...transform,
    x: 0,
  };

  if (!activeNodeRect || !containerNodeRect) {
    return nextTransform;
  }

  const minY = containerNodeRect.top - activeNodeRect.top;
  const maxY = containerNodeRect.bottom - activeNodeRect.bottom;

  return {
    ...nextTransform,
    y: Math.min(Math.max(nextTransform.y, minY), maxY),
  };
};

interface Props {
  routes: Route[] | null;
  loading: boolean;
  onSave?: (routes: RouteDto[]) => Promise<void>;
  routeGradesVisible?: boolean;
  onRouteGradesVisibleChange?: (visible: boolean) => Promise<void>;
  editable?: boolean;
}

export function RoutesTab({
  routes,
  loading,
  onSave,
  routeGradesVisible = true,
  onRouteGradesVisibleChange,
  editable = true,
}: Props) {
  const [routeDrafts, setRouteDrafts] = useState<RouteDraft[]>([]);
  const [routeIncrement, setRouteIncrement] = useState<string>('1');
  const [errors, setErrors] = useState<boolean[]>([]);
  const [reorderMode, setReorderMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const nextRouteId = useRef(0);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function createRouteDraft(route?: Route): RouteDraft {
    nextRouteId.current += 1;
    return {
      clientId: `route-${route?.id ?? "new"}-${nextRouteId.current}`,
      grade: route?.grade ?? BOULDER_GRADE[0],
      pointValue: route?.pointValue ?? null,
    };
  }

  const sortedRoutes = useMemo(
    () => [...(routes ?? [])].sort((a, b) => a.number - b.number),
    [routes]
  );

  useEffect(() => {
    setRouteDrafts(sortedRoutes.map(route => createRouteDraft(route)));
    setErrors(Array(sortedRoutes.length).fill(false));
    setReorderMode(false);
    setEditing(false);
  }, [sortedRoutes]);

  const gradeDistribution = useMemo(() => {
    return BOULDER_GRADE
      .map(grade => ({
        grade,
        label: BoulderGradeMap[grade],
        count: routeDrafts.filter(route => route.grade === grade).length,
      }))
      .filter(row => row.count > 0);
  }, [routeDrafts]);

  const maxGradeCount = Math.max(1, ...gradeDistribution.map(row => row.count));
  const totalPoints = routeDrafts.reduce((sum, route) => sum + (route.pointValue ?? 0), 0);
  const averagePoints = routeDrafts.length ? Math.round(totalPoints / routeDrafts.length) : 0;
  const isFormValid = routeDrafts.every(route => typeof route.pointValue === "number" && !isNaN(route.pointValue));
  const showGrades = editable || routeGradesVisible;

  function setRouteCount(count: number) {
    const nextCount = Math.max(0, count);
    setRouteDrafts(prev => Array.from({ length: nextCount }, (_, index) => (
      prev[index] ?? createRouteDraft()
    )));
    setErrors(prev => Array.from({ length: nextCount }, (_, index) => prev[index] ?? false));
  }

  function updateRoute(index: number, patch: Partial<RouteDraft>) {
    setRouteDrafts(prev => prev.map((route, routeIndex) => (
      routeIndex === index ? { ...route, ...patch } : route
    )));
    if ("pointValue" in patch) {
      setErrors(prev => prev.map((error, routeIndex) => routeIndex === index ? false : error));
    }
  }

  function resetRoutes() {
    setRouteDrafts(sortedRoutes.map(route => createRouteDraft(route)));
    setErrors(Array(sortedRoutes.length).fill(false));
    setReorderMode(false);
    setEditing(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = routeDrafts.findIndex(route => route.clientId === active.id);
    const newIndex = routeDrafts.findIndex(route => route.clientId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setRouteDrafts(prev => arrayMove(prev, oldIndex, newIndex));
    setErrors(prev => arrayMove(prev, oldIndex, newIndex));
  }

  async function handleSave() {
    const nextErrors = routeDrafts.map(route => route.pointValue === null || isNaN(route.pointValue));
    setErrors(nextErrors);
    if (nextErrors.some(Boolean) || !isFormValid) return;

    setSaving(true);
    try {
      await onSave?.(routeDrafts.map((route, index) => ({
        number: index + 1,
        grade: route.grade,
        pointValue: route.pointValue as number,
      })));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-3">
        <div className="rounded-md border border-green/20 bg-shadow p-4 shadow-lg">
          <div className="text-sm font-semibold text-muted">Total Routes</div>
          <div className="text-4xl font-bold leading-tight">{routeDrafts.length}</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="font-semibold text-muted">Points</div>
              <div className="text-lg font-bold">{totalPoints}</div>
            </div>
            <div>
              <div className="font-semibold text-muted">Avg</div>
              <div className="text-lg font-bold">{averagePoints}</div>
            </div>
          </div>
          {editable && (
            <label className="mt-4 flex items-center gap-2 border-t border-green/20 pt-3 text-sm font-semibold">
              <Checkbox
                checked={routeGradesVisible}
                onCheckedChange={(checked) => {
                  onRouteGradesVisibleChange?.(checked === true);
                }}
              />
              <span className="relative top-[1px]">Show grades to climbers</span>
            </label>
          )}
        </div>

        {showGrades ? (
          <div className="rounded-md border border-green/20 bg-shadow p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Grade Distribution</h2>
            {loading && <span className="text-sm text-muted">Loading routes...</span>}
          </div>
          {gradeDistribution.length === 0 ? (
            <div className="flex min-h-21 items-center justify-center rounded-md border border-dashed border-green/20 text-muted">
              No routes yet.
            </div>
          ) : (
            <div className="space-y-2">
              {gradeDistribution.map(row => (
                <div key={row.grade} className="grid grid-cols-[48px_1fr_36px] items-center gap-2 text-sm">
                  <div className="font-semibold">{row.label}</div>
                  <div className="h-5 overflow-hidden rounded-sm bg-background">
                    <div
                      className="h-full rounded-sm bg-green"
                      style={{ width: `${Math.max(8, (row.count / maxGradeCount) * 100)}%` }}
                    />
                  </div>
                  <div className="text-right font-semibold">{row.count}</div>
                </div>
              ))}
            </div>
          )}
          </div>
        ) : (
          <div className="rounded-md border border-green/20 bg-shadow p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Route Details</h2>
              {loading && <span className="text-sm text-muted">Loading routes...</span>}
            </div>
            <div className="flex min-h-21 items-center justify-center rounded-md border border-dashed border-green/20 px-3 text-center text-muted">
              Grades are hidden for this competition.
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        {editable && editing ? (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="w-full md:max-w-xs">
                <h2 className="text-xl font-bold mb-1">Number of Routes</h2>
                <div className="mt-1 flex gap-2">
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => {
                      const step = Math.max(1, Number(routeIncrement) || 1);
                      setRouteCount(
                        Math.max(0, routeDrafts.length - step)
                      );
                    }}
                    disabled={routeDrafts.length === 0 || saving}
                    aria-label="Remove route"
                  >
                    <Minus strokeWidth={3} size={18} />
                  </Button>
                  <Input
                    data-testid="routes-to-add"
                    type="number"
                    min={1}
                    placeholder="1"
                    value={routeIncrement}
                    onChange={e => setRouteIncrement(e.target.value)}
                    disabled={saving}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => {
                      const step = Math.max(1, Number(routeIncrement) || 1);
                      setRouteCount(routeDrafts.length + step);
                    }}
                    disabled={saving}
                    aria-label="Add route"
                  >
                    <Plus strokeWidth={3} size={18} />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={reorderMode ? "default" : "outline"}
                  onClick={() => setReorderMode(prev => !prev)}
                  disabled={saving || routeDrafts.length < 2}
                >
                  <GripVertical size={18} />
                  <span className="relative top-[1px]">{reorderMode ? "Done Reordering" : "Reorder"}</span>
                </Button>
                <Button type="button" variant="accent" onClick={resetRoutes} disabled={saving}>
                  <RotateCcw size={18} />
                  <span className="relative top-[1px]">Cancel</span>
                </Button>
                <Button type="button" onClick={handleSave} disabled={saving}>
                  <Save size={18} />
                  <span className="relative top-[1px]">{saving ? "Saving..." : "Save Routes"}</span>
                </Button>
              </div>
            </div>

            {errors.some(Boolean) && (
              <div className="text-accent">
                Please fill in all point values before saving.
              </div>
            )}
          </>
        ) : editable ? (
          <Button type="button" onClick={() => setEditing(true)}>
            <Pencil size={18} />
            <span className="relative top-[1px]">Edit Routes</span>
          </Button>
        ) : null}

        <div className="overflow-hidden rounded-md border border-green/20 bg-shadow shadow-lg">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictRouteDrag]}
            autoScroll={false}
          >
            <SortableContext
              items={routeDrafts.map(route => route.clientId)}
              strategy={verticalListSortingStrategy}
            >
              <table className="w-full table-fixed border-collapse text-center">
                <thead>
                  <tr className="bg-green text-background font-semibold text-md">
                    {reorderMode && <th className="w-12 border-r py-2 px-3" aria-label="Drag handle" />}
                    <th className="w-24 border-r py-2 px-3">Route #</th>
                    {showGrades && <th className="border-r py-2 px-3">Grade</th>}
                    <th className="py-2 px-3">Point Value</th>
                  </tr>
                </thead>
                <tbody>
                  {routeDrafts.length === 0 ? (
                    <tr>
                      <td colSpan={(reorderMode ? 1 : 0) + (showGrades ? 3 : 2)} className="border-t p-3.5 text-center text-muted">
                        {editable
                          ? "Add routes to build the scorecard for this competition."
                          : "No routes have been published for this competition."}
                      </td>
                    </tr>
                  ) : (
                    routeDrafts.map((route, index) => (
                      <SortableRouteRow
                        key={route.clientId}
                        routeId={route.clientId}
                        reorderMode={reorderMode}
                        disabled={saving}
                      >
                        <td className="border-r border-green/20 px-2 py-2 font-bold">{index + 1}</td>
                        {showGrades && (
                          <td className="border-r border-green/20 px-3 py-2">
                            {editing ? (
                              <Select
                                value={route.grade}
                                onValueChange={(grade: BoulderGrade) => updateRoute(index, { grade })}
                                disabled={saving}
                              >
                                <SelectTrigger data-testid={`route-grade-${index}`} className="bg-background">
                                  <SelectValue placeholder={BoulderGradeMap.UNGRADED} />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 w-auto bg-background">
                                  {BOULDER_GRADE.map(grade => (
                                    <SelectItem key={grade} value={grade}>
                                      {BoulderGradeMap[grade]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="font-semibold">{BoulderGradeMap[route.grade]}</span>
                            )}
                          </td>
                        )}
                        <td className="px-3 py-2">
                          {editing ? (
                            <Input
                              data-testid={`route-points-${index}`}
                              type="number"
                              min={0}
                              step={10}
                              value={route.pointValue === null || isNaN(route.pointValue) ? "" : route.pointValue}
                              onChange={event => {
                                const value = event.target.value;
                                updateRoute(index, { pointValue: value === "" ? NaN : parseInt(value, 10) });
                              }}
                              disabled={saving}
                              className={`bg-background ${errors[index] ? "border-accent focus:border-accent" : ""}`}
                            />
                          ) : (
                            <span className="font-semibold">{route.pointValue ?? "—"}</span>
                          )}
                        </td>
                      </SortableRouteRow>
                    ))
                  )}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        </div>
      </section>
    </div>
  );
}
