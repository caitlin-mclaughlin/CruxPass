#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
GRADLE_WRAPPER="./gradlew"
if [ -x "$GRADLE_WRAPPER" ]; then
  GRADLE="$GRADLE_WRAPPER"
else
  GRADLE="gradle"
fi

PROJECT="${1:-:backend}"
OUT_DEPS="${2:-backend-deps.txt}"
OUT_GAVS="${3:-backend-gavs.txt}"
OUT_JSON="${4:-backend-dependencies.json}"
OUT_LOC="${5:-backend-dependency-locations.json}"

echo "Resolving dependencies for project $PROJECT using $GRADLE..."
$GRADLE "$PROJECT:dependencies" --configuration runtimeClasspath > "$OUT_DEPS" 2>&1

echo "Extracting GAV coordinates..."
# Match patterns like group:artifact:version
grep -oE '([A-Za-z0-9_.-]+:){2,}[A-Za-z0-9_.-]+' "$OUT_DEPS" | sed 's/ *$//' | sort -u > "$OUT_GAVS"

echo "Writing JSON array: $OUT_JSON"
{
  printf '['
  first=1
  while read -r gav; do
    [ -z "$gav" ] && continue
    if [ $first -eq 0 ]; then printf ','; fi
    printf '\n  "%s"' "$gav"
    first=0
  done < "$OUT_GAVS"
  printf '\n]\n'
} > "$OUT_JSON"

echo "Locating declaring build files for dependencies (best-effort)..."
{
  printf '['
  first=1
  while read -r gav; do
    [ -z "$gav" ] && continue
    group=$(echo "$gav" | cut -d: -f1)
    artifact=$(echo "$gav" | cut -d: -f2)
    file=''
    lineno=0
    # Search common build files for a declaration containing group:artifact or "group:artifact"
    match=$(grep -R --line-number --exclude-dir=.gradle -E "${group}:${artifact}|\"${group}:${artifact}\"|'${group}:${artifact}'" . 2>/dev/null | head -n1 || true)
    if [ -n "$match" ]; then
      file=$(echo "$match" | cut -d: -f1)
      lineno=$(echo "$match" | cut -d: -f2)
      file=${file#./}
    else
      file=""
      lineno=0
    fi
    if [ $first -eq 0 ]; then printf ','; fi
    printf '\n  { "gav": "%s", "filePath": "%s", "lineNumber": %d }' "$gav" "$file" "$lineno"
    first=0
  done < "$OUT_GAVS"
  printf '\n]\n'
} > "$OUT_LOC"

echo "Done. Files generated:"
echo " - $OUT_DEPS"
echo " - $OUT_GAVS"
echo " - $OUT_JSON"
echo " - $OUT_LOC"

exit 0
