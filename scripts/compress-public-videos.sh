#!/usr/bin/env bash
# Re-encodes public/videos/*.mp4 for smaller Git/deploy size (same paths, same UX).
#
# Requires: ffmpeg (brew install ffmpeg)
#
# Defaults tuned for web backgrounds (hero/about/services). Override:
#   MAX_W=1280 CRF=26 ./scripts/compress-public-videos.sh
#   MAX_W=960  CRF=28 ./scripts/compress-public-videos.sh   # smaller still

set -euo pipefail

MAX_W="${MAX_W:-1280}"
CRF="${CRF:-26}"
PRESET="${PRESET:-medium}"

DIR="$(cd "$(dirname "$0")/.." && pwd)"
VID="${DIR}/public/videos"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Install ffmpeg first, e.g.: brew install ffmpeg" >&2
  exit 1
fi

shopt -s nullglob
files=("${VID}"/*.mp4)
if [[ ${#files[@]} -eq 0 ]]; then
  echo "No MP4 files under ${VID}" >&2
  exit 0
fi

echo "MAX_W=${MAX_W} CRF=${CRF} PRESET=${PRESET}"
echo ""

has_audio_streams() {
  ffprobe -v error -select_streams a -show_entries stream=codec_type \
    -of csv=p=0 "$1" 2>/dev/null | grep -q .
}

for f in "${files[@]}"; do
  base=$(basename "$f")
  tmp="${f}.compressing.tmp.mp4"
  echo "→ ${base}"
  if has_audio_streams "$f"; then
    map_audio=(-map "0:a:0")
    audio_enc=(-c:a aac -b:a 96k -ac 2)
  else
    map_audio=()
    audio_enc=(-an)
  fi
  ffmpeg -hide_banner -loglevel warning -stats -y -i "$f" \
    -vf "scale='min(${MAX_W},iw)':-2,format=yuv420p" \
    -map "0:v:0" "${map_audio[@]}" \
    -c:v libx264 -preset "${PRESET}" -crf "${CRF}" \
    "${audio_enc[@]}" \
    -movflags +faststart \
    "$tmp"
  mv "$tmp" "$f"
done

echo ""
echo "Done. New sizes:"
ls -lah "${VID}"/*.mp4 | awk '{print $5, $9}'
