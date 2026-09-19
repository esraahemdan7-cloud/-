import React, { useEffect } from 'react';
import { Player } from '../types';
import { playVictorySound } from '../audio';

interface VictoryOverlayProps {
  winner: Player;
  reason: string;
  onPlayAgain: () => void;
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({
  winner,
  reason,
  onPlayAgain,
}) => {
  useEffect(() => {
    playVictorySound();
  }, []);

  // Generate 90 multicolored confetti pieces
  const confettiPieces = Array.from({ length: 90 }, (_, i) => {
    const left = Math.random() * 100;
    const animDelay = Math.random() * 3;
    const animDuration = 2.5 + Math.random() * 2.5;
    const size = 6 + Math.random() * 8;
    const colors = [
      '#f59e0b',
      '#ef4444',
      '#3b82f6',
      '#10b981',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#ffd700',
    ];
    const bg = colors[i % colors.length];

    return (
      <div
        key={`confetti-${i}`}
        className="confetti-piece"
        style={{
          left: `${left}%`,
          animationDelay: `${animDelay}s`,
          animationDuration: `${animDuration}s`,
          width: `${size}px`,
          height: `${size * 1.5}px`,
          backgroundColor: bg,
        }}
      />
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Victory Announcement"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-[#02102e]/95 via-[#06245e]/95 to-[#02102e]/95 backdrop-blur-md overflow-hidden select-none"
    >
      {/* Confetti container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiPieces}
      </div>

      {/* Main Card */}
      <div className="relative z-10 max-w-lg w-full bg-gradient-to-b from-[#092257] via-[#0b2d70] to-[#081b44] border-4 border-amber-400/80 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(251,191,36,0.6)] flex flex-col items-center animate-popIn">
        {/* Large Golden Trophy */}
        <div className="text-6xl sm:text-7xl mb-2 filter drop-shadow-[0_4px_20px_rgba(251,191,36,0.8)] animate-bounce">
          🏆
        </div>

        {/* Victory Title */}
        <h2 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-wider uppercase mb-2">
          Victory!
        </h2>

        {/* Player Name and Badge */}
        <div className="my-3 flex items-center gap-2 justify-center">
          <span
            className="w-5 h-5 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: winner.color }}
          />
          <span
            className="text-2xl sm:text-3xl font-black text-white px-3 py-1 rounded-xl shadow-inner border"
            style={{
              borderColor: winner.color,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {winner.name}
          </span>
        </div>

        {/* Winning reason */}
        <p className="text-cyan-200 font-bold text-base sm:text-lg mb-6 max-w-xs">
          {winner.name} has {reason}!
        </p>

        {/* Play Again Button */}
        <button
          id="play-again-btn"
          type="button"
          onClick={onPlayAgain}
          className="py-3.5 px-8 rounded-2xl font-black text-lg text-white tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.6)] bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-500 hover:brightness-110 active:scale-95 transition-all border-2 border-emerald-300 focus:outline-none focus:ring-4 focus:ring-amber-300 cursor-pointer"
        >
          Play again ↻
        </button>
      </div>
    </div>
  );
};
