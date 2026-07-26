import { LanguageStats, Theme } from "../engine/types";

// Palette & helpers
function adjustColor(hex: string, amount: number): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const h = hex.replace("#", "");
  const r = clamp(parseInt(h.substring(0, 2), 16) + amount);
  const g = clamp(parseInt(h.substring(2, 4), 16) + amount);
  const b = clamp(parseInt(h.substring(4, 6), 16) + amount);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

// SVG card dimensions
const W = 495;

// Bar chart layout (left side)
const BAR_LEFT = 18;
const BAR_RIGHT_MAX = 310; // max x where bars end
const BAR_WIDTH_TOTAL = BAR_RIGHT_MAX - BAR_LEFT; // 292px
const ROW_START_Y = 50; // y of first bar top-edge
const ROW_HEIGHT = 17; // bar height
const ROW_GAP = 7; // gap between bars
const ROW_STEP = ROW_HEIGHT + ROW_GAP;
const MAX_BARS = 6; // first N languages get full-width bars

// Extra chips (languages 7+)
const CHIP_ROW_Y_BASE = ROW_START_Y + MAX_BARS * ROW_STEP + 6; // starts just below bars
const CHIP_H = 18;
const CHIP_GAP_X = 6;
const CHIP_GAP_Y = 5;
const CHIP_DOT = 6; // dot radius area
const CHIP_PAD_X = 8;
const CHIP_FONT = 10;
const CHIP_CHARS_PER_COL = 7; // approx char-width budget per chip

// Donut layout (right side)
const DONUT_CX = 415;
const DONUT_CY = 100;
const DONUT_R = 52;
const DONUT_STROKE = 14;

// Donut helpers
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    start.x.toFixed(3),
    start.y.toFixed(3),
    "A",
    r,
    r,
    0,
    largeArc,
    0,
    end.x.toFixed(3),
    end.y.toFixed(3),
  ].join(" ");
}

/** Estimate pixel width of a chip: dot + space + name + space + pct */
function chipWidth(lang: { name: string; percentage: number }): number {
  const label = `${lang.name} ${lang.percentage.toFixed(1)}%`;
  // ~6.2px per char at 10px Segoe UI, plus dot (CHIP_DOT+4) + 2×padding
  return CHIP_DOT + 4 + label.length * 6.2 + CHIP_PAD_X * 2;
}

// Main renderer
export function generateLanguagesSVG(
  stats: LanguageStats,
  theme: Theme,
): string {
  const { languages, username } = stats;

  // Split into bars vs chips
  const barLangs = languages.slice(0, MAX_BARS);
  const chipLangs = languages.slice(MAX_BARS);

  // Layout: compute chip rows
  // Chips are packed left-to-right, wrapping when they exceed BAR_RIGHT_MAX
  type ChipPos = {
    lang: (typeof chipLangs)[0];
    x: number;
    y: number;
    w: number;
  };
  const chipPositions: ChipPos[] = [];
  let chipX = BAR_LEFT;
  let chipY = CHIP_ROW_Y_BASE;

  for (const lang of chipLangs) {
    const w = Math.round(chipWidth(lang));
    if (chipX + w > BAR_RIGHT_MAX && chipX !== BAR_LEFT) {
      // wrap to next row
      chipX = BAR_LEFT;
      chipY += CHIP_H + CHIP_GAP_Y;
    }
    chipPositions.push({ lang, x: chipX, y: chipY, w });
    chipX += w + CHIP_GAP_X;
  }

  // Total card height: chips end + bottom padding
  const chipRowsUsed =
    chipLangs.length > 0 ? chipY + CHIP_H - CHIP_ROW_Y_BASE + 1 : 0;
  const H = CHIP_ROW_Y_BASE + chipRowsUsed + 18;

  if (languages.length === 0) {
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" rx="10" fill="${theme.background}"/>
  <text x="${W / 2}" y="${H / 2}" text-anchor="middle" font-family="Segoe UI, Ubuntu, sans-serif" font-size="14" fill="${theme.textMuted}">No language data found.</text>
</svg>`;
  }

  // Build bar rows
  const maxPct = barLangs[0].percentage;

  const barRows = barLangs
    .map((lang, i) => {
      const barW = Math.round((lang.percentage / maxPct) * BAR_WIDTH_TOTAL);
      const y = ROW_START_Y + i * ROW_STEP;
      const animDelay = (i * 0.07).toFixed(2);
      const glow = adjustColor(lang.color, 40);

      return `
      <!-- row ${i}: ${lang.name} -->
      <g class="lang-row" style="animation-delay:${animDelay}s">
        <rect x="${BAR_LEFT}" y="${y}" width="${BAR_WIDTH_TOTAL}" height="${ROW_HEIGHT}" rx="4" fill="${theme.surface}"/>
        <rect class="lang-bar" x="${BAR_LEFT}" y="${y}" width="${barW}" height="${ROW_HEIGHT}" rx="4" fill="${lang.color}"
              style="animation-delay:${animDelay}s;"
              filter="url(#bar-glow-${i})"/>
        <text x="${BAR_LEFT + 7}" y="${y + 12}" class="bar-label">${lang.name}</text>
        <text x="${BAR_RIGHT_MAX + 6}" y="${y + 12}" class="pct-label">${lang.percentage.toFixed(1)}%</text>
      </g>
      <defs>
        <filter id="bar-glow-${i}" x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feFlood flood-color="${glow}" flood-opacity="0.35" result="color"/>
          <feComposite in="color" in2="blur" operator="in" result="glow"/>
          <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>`;
    })
    .join("\n");

  // Build extra-language chips
  const chipItems = chipPositions
    .map(({ lang, x, y, w }, i) => {
      const animDelay = (MAX_BARS * 0.07 + i * 0.05).toFixed(2);
      return `
      <!-- chip: ${lang.name} -->
      <g class="lang-chip" style="animation-delay:${animDelay}s">
        <rect x="${x}" y="${y}" width="${w}" height="${CHIP_H}" rx="${CHIP_H / 2}" fill="${theme.surface}"/>
        <circle cx="${x + CHIP_PAD_X + CHIP_DOT / 2}" cy="${y + CHIP_H / 2}" r="${CHIP_DOT / 2}" fill="${lang.color}"/>
        <text x="${x + CHIP_PAD_X + CHIP_DOT + 4}" y="${y + CHIP_H / 2 + 4}" class="chip-label">${lang.name} <tspan class="chip-pct">${lang.percentage.toFixed(1)}%</tspan></text>
      </g>`;
    })
    .join("\n");

  // Build donut segments
  let angleOffset = 0;
  const GAP_DEG = 3;

  const donutSegments = languages
    .map((lang, i) => {
      const sweep = (lang.percentage / 100) * 360;
      const start = angleOffset;
      const end = angleOffset + sweep - GAP_DEG;
      angleOffset += sweep;

      if (sweep < GAP_DEG + 1) return "";

      const d = describeArc(DONUT_CX, DONUT_CY, DONUT_R, start, end);
      const animDelay = (i * 0.06).toFixed(2);
      const segLen = (Math.PI * 2 * DONUT_R * (sweep / 360)).toFixed(2);

      return `<path class="donut-seg" d="${d}" stroke="${lang.color}" stroke-width="${DONUT_STROKE}" fill="none" stroke-linecap="round"
              style="animation-delay:${animDelay}s; --seg-len:${segLen};"/>`;
    })
    .join("\n");

  const topLang = languages[0];

  // CSS
  const css = `
    .card-bg { fill: ${theme.background}; }

    .title-text {
      font: 600 13px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${theme.textSecondary};
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .username-text {
      font: bold 15px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${theme.textPrimary};
    }

    /* Full-width bar labels */
    .bar-label {
      font: 600 10px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #FFFFFF;
      dominant-baseline: auto;
    }
    .pct-label {
      font: 400 10px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${theme.textSubtle};
      dominant-baseline: auto;
    }

    /* Chip labels */
    .chip-label {
      font: 600 ${CHIP_FONT}px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${theme.textBody};
      dominant-baseline: auto;
    }
    .chip-pct {
      font-weight: 400;
      fill: ${theme.textSubtle};
    }

    /* Donut center */
    .donut-center-name {
      font: bold 13px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${theme.textPrimary};
      text-anchor: middle;
      dominant-baseline: middle;
    }
    .donut-center-sub {
      font: 400 9px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${theme.textMuted};
      text-anchor: middle;
    }

    /* INTRO ANIMATIONS */
    @keyframes card-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .card-group {
      animation: card-in 0.5s cubic-bezier(0.22,1,0.36,1) both;
    }

    @keyframes bar-grow {
      from { clip-path: inset(0 100% 0 0); opacity: 0; }
      to   { clip-path: inset(0 0% 0 0);   opacity: 1; }
    }
    .lang-bar {
      clip-path: inset(0 100% 0 0);
      animation: bar-grow 0.6s cubic-bezier(0.22,1,0.36,1) both;
    }

    @keyframes row-in {
      from { opacity: 0; transform: translateX(-8px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .lang-row {
      opacity: 0;
      animation: row-in 0.45s cubic-bezier(0.22,1,0.36,1) both;
    }

    @keyframes chip-in {
      from { opacity: 0; transform: scale(0.85); }
      to   { opacity: 1; transform: scale(1); }
    }
    .lang-chip {
      opacity: 0;
      transform-box: fill-box;
      transform-origin: center;
      animation: chip-in 0.35s cubic-bezier(0.22,1,0.36,1) both;
    }

    @keyframes donut-draw {
      from { stroke-dashoffset: var(--seg-len); opacity: 0; }
      to   { stroke-dashoffset: 0; opacity: 1; }
    }
    .donut-seg {
      stroke-dasharray: var(--seg-len);
      stroke-dashoffset: var(--seg-len);
      opacity: 0;
      animation: donut-draw 0.7s cubic-bezier(0.22,1,0.36,1) both;
    }

    @keyframes center-pop {
      0%   { opacity: 0; transform: scale(0.7); }
      80%  { opacity: 1; transform: scale(1.08); }
      100% { transform: scale(1); }
    }
    .donut-center {
      transform-box: fill-box;
      transform-origin: center;
      animation: center-pop 0.55s cubic-bezier(0.22,1,0.36,1) 0.45s both;
    }
  `;

  // Full SVG
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none"
     xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="Top languages for ${username}">
  <title>Most Used Languages — ${username}</title>
  <defs>
    <clipPath id="card-clip">
      <rect width="${W}" height="${H}" rx="10"/>
    </clipPath>
  </defs>

  <style>${css}</style>

  <g class="card-group">
    <g clip-path="url(#card-clip)">
      <!-- Background -->
      <rect class="card-bg" width="${W}" height="${H}" rx="10"/>

      <!-- Header -->
      <text x="${BAR_LEFT}" y="23" class="title-text">Most Used Languages</text>
      <text x="${W - 18}" y="23" text-anchor="end" class="username-text">@${username}</text>

      <!-- Separator -->
      <line x1="${BAR_LEFT}" y1="32" x2="${BAR_RIGHT_MAX + 50}" y2="32" stroke="${theme.border}" stroke-width="1"/>

      <!-- Bar chart rows (top ${MAX_BARS}) -->
${barRows}

      ${
        chipLangs.length > 0
          ? `<!-- Extra language chips -->
${chipItems}`
          : ""
      }

      <!-- Donut chart -->
      <circle cx="${DONUT_CX}" cy="${DONUT_CY}" r="${DONUT_R}" stroke="${theme.surface}" stroke-width="${DONUT_STROKE}" fill="none"/>
${donutSegments}

      <!-- Donut center -->
      <g class="donut-center">
        <text x="${DONUT_CX}" y="${DONUT_CY - 6}" class="donut-center-name">${topLang.name}</text>
        <text x="${DONUT_CX}" y="${DONUT_CY + 10}" class="donut-center-sub">${topLang.percentage.toFixed(1)}%</text>
        <text x="${DONUT_CX}" y="${DONUT_CY + 22}" class="donut-center-sub">top lang</text>
      </g>
    </g>
  </g>
</svg>`;
}
