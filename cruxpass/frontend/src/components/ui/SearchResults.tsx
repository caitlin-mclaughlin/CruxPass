import { formatDate, formatPhoneNumber } from "@/utils/formatters"
import { SimpleClimber, SimpleGym, SimpleSeries } from "@/models/domain"
import { LoadingSnippet } from "./loading/LoadingSnippet"

type SearchMode = "climber" | "gym" | "series"

interface BaseProps<T> {
  results: T[]
  selectedId: number | null
  affiliatedIds?: number[]
  onSelect: (id: number) => void
  loading?: boolean
}

type Props =
  | ({ mode: "climber" } & BaseProps<SimpleClimber>)
  | ({ mode: "gym" } & BaseProps<SimpleGym>)
  | ({ mode: "series" } & BaseProps<SimpleSeries>)

// --- width estimator: based on average ~7px per character for text-sm
function estimateWidthPx(text: string): number {
  if (!text) return 40
  const chars = text.length
  const approx = chars * 7 // px per char
  return Math.ceil(approx + 16) // padding space
}

export function SearchResults({
  mode,
  results,
  selectedId,
  affiliatedIds = [],
  onSelect,
  loading = false,
}: Props) {
  const isClimber = mode === "climber"
  const isGym = mode === "gym"
  const isSeries = mode === "series"

  if (loading) {
    return (
      <LoadingSnippet 
        text={"Searching..."}
        className={"h-full w-full flex flex-col items-center justify-center"}
      />
    )
  }

  if (!results.length) {
    return (
      <div className="absolute left-6 right-6 border border-green bg-shadow rounded-md shadow-lg z-10 p-2 text-center text-green italic text-sm">
        {isSeries ? (
          <span>No {mode} found.</span>
        ) : (
          <span>No {mode}s found.</span>
        )}
      </div>
    )
  }

  // --- dynamic header labels
  const headers = isClimber
    ? ["Name", "Email", "Phone", "Birthday"]
    : isGym
      ? ["Gym Name", "Email", "Phone", "City, State"]
      : ["Series Name", "Email", "Start Date", "End Date"]

  // --- build matrix of all cell values (header + rows)
  const rows: string[][] = [
    headers,
    ...results.map((r) => {
      const name =
        isClimber ? (r as SimpleClimber).name :
        isGym ? (r as SimpleGym).name :
        (r as SimpleSeries).name

      const email = r.email ?? "--"

      const phone =
        isClimber || isGym
          ? (r as any).phone ? formatPhoneNumber((r as any).phone) : "--"
          : ""

      const cityState =
        isGym
          ? `${(r as SimpleGym).address.city}, ${(r as SimpleGym).address.state}`
          : ""

      const startDate =
        isSeries ? formatDate(new Date((r as SimpleSeries).startDate)) : ""

      const endDate =
        isSeries ? formatDate(new Date((r as SimpleSeries).endDate)) : ""

      const dob =
        isClimber ? formatDate(new Date((r as SimpleClimber).dob)) : ""

      return isClimber
        ? [name, email, phone, dob]
        : isGym
          ? [name, email, phone, cityState]
          : [name, email, startDate, endDate]
    }),
  ]

  // --- compute max widths per column
  const colCount = headers.length
  const colWidths: number[] = new Array(colCount).fill(0)

  rows.forEach((row) => {
    row.forEach((cell, colIdx) => {
      const approxWidth = estimateWidthPx(cell)
      if (approxWidth > colWidths[colIdx]) {
        colWidths[colIdx] = approxWidth
      }
    })
  })

  const gridTemplateColumns = colWidths.map((w) => `${w}px`).join(" ")

  return (
    <div className="absolute left-6 right-6 max-h-56 overflow-y-auto overflow-x-auto scrollbar-thin-green scroll-smooth border border-green bg-shadow rounded-md shadow-lg z-10 text-sm">
      
      {/* HEADER */}
      <div
        className="grid gap-2 w-max px-2 py-1 bg-green text-background font-semibold border-b border-green"
        style={{ gridTemplateColumns }}
      >
        {headers.map((label, i) => (
          <span key={i} className={i < headers.length - 1 ? "border-r text-center border-bg pr-2" : "text-center"}>
            {label}
          </span>
        ))}
      </div>

      {/* ROWS */}
      {results.map((r) => {
        const id = r.id

        const baseClasses =
          "grid gap-2 w-max px-2 py-1 text-left transition border-b"

        const isSelected = selectedId === id
        const isAffiliated = affiliatedIds.includes(id)

        const borderColor = isSelected
          ? "border-background"
          : isAffiliated
            ? "border-highlight"
            : "border-green"

        const textColor = isSelected
          ? "text-background"
          : isAffiliated
            ? "text-highlight"
            : "text-green"

        const bgColor = isSelected
          ? "bg-highlight"
          : isAffiliated
            ? "bg-shadow"
            : "bg-background hover:bg-shadow hover:font-semibold"

        // extract row data in same order as headers
        const row = rows.find((row) => row[0] === (
          isClimber ? (r as SimpleClimber).name :
          isGym ? (r as SimpleGym).name :
          (r as SimpleSeries).name
        ))!

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`${baseClasses} ${bgColor} ${textColor} ${borderColor}`}
            style={{ gridTemplateColumns }}
          >
            {row.map((cell, i) => (
              <span key={i} className={i < row.length - 1 ? `truncate text-center border-r pr-2 ${borderColor}` : "truncate text-center"}>
                {cell}
              </span>
            ))}
          </button>
        )
      })}
    </div>
  )
}
