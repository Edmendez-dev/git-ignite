import { StreakStats } from "../engine/types";

export function generateSVG(stats: StreakStats): string {
  const { currentStreak, level } = stats;

  const theme = {
    flameColor: level === 3 ? "#FF4500" : level === 2 ? "#FFA500" : "#717171",
    animationName:
      level === 3 ? "beast-glow" : level === 2 ? "steady-burn" : "none",
    opacity: level === 0 ? "0.3" : "1",
  };

  return `
    <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .streak-text { font: bold 35px 'Segoe UI', Ubuntu, Sans-Serif; fill: #FFFFFF; }
        .label-text { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #8B949E; }
        .flame { 
          fill: ${theme.flameColor}; 
          opacity: ${theme.opacity};
          animation: ${theme.animationName} 2s infinite ease-in-out; 
        }
        
        @keyframes beast-glow {
          0%, 100% { filter: drop-shadow(0 0 5px #FF4500); transform: scale(1); }
          50% { filter: drop-shadow(0 0 20px #FF0000); transform: scale(1.05); }
        }
        @keyframes steady-burn {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      </style>

      <rect width="495" height="195" rx="10" fill="#0D1117" />
      
      <path class="flame" d="M247.5 40C247.5 40 210 90 210 120C210 140.711 226.789 157.5 247.5 157.5C268.211 157.5 285 140.711 285 120C285 90 247.5 40 247.5 40Z" />

      <text x="30" y="160" class="streak-text">${currentStreak} Day Streak</text>
      <text x="30" y="180" class="label-text">GITIGNITE ENGINE • LEVEL ${level}</text>
    </svg>
    `;
}
