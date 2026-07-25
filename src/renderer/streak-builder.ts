import { StreakStats } from "../engine/types";
import { FLAME_FRAMES, FLAME_TIER_COLORS } from "./flame-frames";

function formatStartDate(iso: string | null): string {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-").map(Number);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[month - 1]} ${String(day).padStart(2, "0")}, ${year}`;
}

export function generateSVG(stats: StreakStats): string {
  const { currentStreak, level, tier, totalContributions, startDate } = stats;
  const tierMap: Record<StreakStats["tier"], 1 | 2 | 3> = {
    ignition: 1,
    "short-circuit": 2,
    overload: 3,
  };
  const tierNum = tierMap[tier];

  const tierColors = FLAME_TIER_COLORS[tierNum];

  let animDuration = "1.6s";
  let containerFilter = `drop-shadow(0 0 6px ${tierColors.base})`;
  let containerOpacity = "1";
  let glowAnimation = "none";

  if (level >= 3) {
    animDuration = "0.8s";
    containerFilter = `drop-shadow(0 0 12px ${tierColors.base}) drop-shadow(0 0 25px ${tierColors.middle})`;
    glowAnimation = "beast-glow 1.5s infinite ease-in-out";
  } else if (level === 2) {
    animDuration = "1.2s";
    containerFilter = `drop-shadow(0 0 10px ${tierColors.base})`;
    glowAnimation = "steady-burn 2s infinite ease-in-out";
  } else if (level === 0) {
    animDuration = "2.4s";
    containerFilter = "grayscale(100%)";
    containerOpacity = "0.3";
  }

  const durationSec = parseFloat(animDuration);
  const stepTime = durationSec / 16;
  const scale = 2.7;
  const centerX = 247.5;
  const bottomY = 138;

  const frameElements = FLAME_FRAMES.map((f) => {
    const width = (f.vw * scale).toFixed(2);
    const height = (f.vh * scale).toFixed(2);
    const x = (centerX - (f.vw * scale) / 2).toFixed(2);
    const y = (bottomY - f.vh * scale).toFixed(2);

    const content = f.content
      .replaceAll("#fe4b20", tierColors.base)
      .replaceAll("#ffa034", tierColors.middle)
      .replaceAll("#ffdd58", tierColors.core);

    return `
      <g class="flame-frame frame-${f.id}">
        <svg viewBox="${f.viewBox}" width="${width}" height="${height}" x="${x}" y="${y}">
          ${content}
        </svg>
      </g>`;
  }).join("");

  const cssDelays = FLAME_FRAMES.map((f, index) => {
    const delay = (index * stepTime).toFixed(3);
    return `        .frame-${f.id} { animation-delay: ${delay}s; }`;
  }).join("\n");

  return `
    <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <style>
        .streak-text { font: bold 35px 'Segoe UI', Ubuntu, Sans-Serif; fill: #FFFFFF; }
        .label-text { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #8B949E; }
        .stat-value { font: 600 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: #E6EDF3; text-anchor: end; }
        .stat-label { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #484F58; text-anchor: end; letter-spacing: 0.04em; }
        
        .flame-container {
          filter: ${containerFilter};
          opacity: ${containerOpacity};
          animation: ${glowAnimation};
        }

        .flame-frame {
          opacity: 0;
          animation: flame-cycle ${animDuration} infinite steps(1);
        }

${cssDelays}

        @keyframes flame-cycle {
          0%, 6.25% { opacity: 1; }
          6.251%, 100% { opacity: 0; }
        }

        @keyframes beast-glow {
          0%, 100% { filter: drop-shadow(0 0 8px ${tierColors.base}) drop-shadow(0 0 15px ${tierColors.middle}); transform-origin: 247.5px 138px; }
          50% { filter: drop-shadow(0 0 18px ${tierColors.base}) drop-shadow(0 0 35px ${tierColors.middle}); transform-origin: 247.5px 138px; }
        }
        @keyframes steady-burn {
          0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 8px ${tierColors.base}); }
          50% { opacity: 1; filter: drop-shadow(0 0 15px ${tierColors.middle}); }
        }
      </style>

      <rect width="495" height="195" rx="10" fill="#0D1117" />
      
      <g class="flame-container">
${frameElements}
      </g>

      <text x="30" y="160" class="streak-text">${currentStreak} Day Streak</text>
      <text x="30" y="180" class="label-text">GITIGNITE • LEVEL ${level}</text>

      <!-- Top-right stats block -->
      <text x="465" y="30" class="stat-value">${totalContributions.toLocaleString()} Contributions</text>
      <text x="465" y="45" class="stat-label">${formatStartDate(startDate)} — Present</text>
    </svg>
    `;
}
