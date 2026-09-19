import React from 'react';
import { Player, QuestionRecord, BannerEvent } from '../types';
import { BOARD_BASE64, RAW_BOARD_URL } from '../assetsData';

interface BoardProps {
  players: Player[];
  activePlayerIndex: number;
  questions: QuestionRecord[];
  onOpenQuestion: (squareNum: number) => void;
  bannerEvent: BannerEvent | null;
  movingPlayerId: number | null;
}

// 5 columns x 4 rows serpentine square order:
// Top row: 20, 19, 18, 17, 16
// Second row: 11, 12, 13, 14, 15
// Third row: 10, 9, 8, 7, 6
// Bottom row: 1, 2, 3, 4, 5
const GRID_SQUARES = [
  [20, 19, 18, 17, 16],
  [11, 12, 13, 14, 15],
  [10, 9, 8, 7, 6],
  [1, 2, 3, 4, 5],
];

// 5 repeating column icon colors: green, blue, purple, coral, orange
const ICON_COLORS = ['#18a75b', '#1878ee', '#8a4de1', '#ff5d66', '#ef8b20'];

export const Board: React.FC<BoardProps> = ({
  players,
  activePlayerIndex,
  questions,
  onOpenQuestion,
  bannerEvent,
  movingPlayerId,
}) => {
  // Compute square offsets for clustered tokens
  const getTokenClusterStyle = (indexInSquare: number, totalInSquare: number) => {
    if (totalInSquare <= 1) {
      return { transform: 'translate(-50%, -50%)' };
    }
    // Clamping offsets based on total count
    if (totalInSquare === 2) {
      const offsetX = indexInSquare === 0 ? -12 : 12;
      return { transform: `translate(calc(-50% + ${offsetX}px), -50%)` };
    }
    if (totalInSquare === 3) {
      if (indexInSquare === 0) return { transform: 'translate(calc(-50% - 10px), calc(-50% - 10px))' };
      if (indexInSquare === 1) return { transform: 'translate(calc(-50% + 10px), calc(-50% - 10px))' };
      return { transform: 'translate(-50%, calc(-50% + 10px))' };
    }
    if (totalInSquare === 4) {
      const dx = indexInSquare % 2 === 0 ? -11 : 11;
      const dy = indexInSquare < 2 ? -11 : 11;
      return { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))` };
    }
    // 5 players
    if (indexInSquare === 0) return { transform: 'translate(calc(-50% - 12px), calc(-50% - 12px))' };
    if (indexInSquare === 1) return { transform: 'translate(calc(-50% + 12px), calc(-50% - 12px))' };
    if (indexInSquare === 2) return { transform: 'translate(-50%, -50%)' };
    if (indexInSquare === 3) return { transform: 'translate(calc(-50% - 12px), calc(-50% + 12px))' };
    return { transform: 'translate(calc(-50% + 12px), calc(-50% + 12px))' };
  };

  // Group players by square position (1..20)
  const playersBySquare: Record<number, Player[]> = {};
  const dockPlayers: Player[] = [];

  players.forEach((p) => {
    if (p.position === 0) {
      dockPlayers.push(p);
    } else {
      if (!playersBySquare[p.position]) {
        playersBySquare[p.position] = [];
      }
      playersBySquare[p.position].push(p);
    }
  });

  return (
    <section aria-label="Game Board" className="w-full flex flex-col items-center select-none">
      {/* Visual banner announcement (Ladder / Snake / Exact roll) */}
      {bannerEvent && (
        <div
          className={`w-full mb-3 px-4 py-2.5 rounded-xl text-center font-bold text-base sm:text-lg border shadow-lg animate-bounce transition-all duration-300 ${
            bannerEvent.type === 'ladder'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white border-emerald-300 shadow-emerald-500/40'
              : bannerEvent.type === 'snake'
              ? 'bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white border-red-300 shadow-rose-600/40'
              : 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 text-white border-yellow-300 shadow-amber-500/40'
          }`}
          role="status"
          aria-live="assertive"
        >
          {bannerEvent.type === 'snake' && <span className="text-3xl mr-2">😭</span>}
          {bannerEvent.type === 'ladder' && <span className="text-2xl mr-2">🪜✨</span>}
          {bannerEvent.message}
        </div>
      )}

      {/* Outer Golden Halo & Metallic Cyan Frame */}
      <div className="board-halo-container relative p-[8px] sm:p-[12px] rounded-[24px] shadow-[0_0_50px_rgba(255,215,0,0.35),0_10px_40px_rgba(2,132,199,0.5)] bg-gradient-to-br from-[#40e8ff] via-[#0876ed] to-[#582bc2] border-2 border-[#40e8ff]/80">
        {/* Inner Frame with 3D Depth */}
        <div className="relative rounded-[16px] overflow-hidden bg-[#0a1a3a] border border-[#02a5eb]/60 shadow-inner">
          {/* Mandatory Board Image (Exact alignment specified in prompt) */}
          <img
            src={BOARD_BASE64 || RAW_BOARD_URL}
            alt="Snakes and Ladder Educational Board"
            className="absolute pointer-events-none select-none"
            style={{
              left: '49.5%',
              top: '52.8%',
              width: '120%',
              height: '123%',
              transform: 'translate(-50%, -50%)',
              objectFit: 'fill',
            }}
          />

          {/* 5x4 Grid of Transparent Hit Areas */}
          <div className="relative grid grid-cols-5 grid-rows-4 w-[min(90vw,680px)] h-[min(72vw,544px)] sm:w-[620px] sm:h-[496px] md:w-[680px] md:h-[544px]">
            {GRID_SQUARES.map((row, rIdx) =>
              row.map((sqNum, cIdx) => {
                const hasQuestion = questions[sqNum - 1] && questions[sqNum - 1].q.trim().length > 0;
                const iconColor = ICON_COLORS[cIdx % 5];
                const squarePlayers = playersBySquare[sqNum] || [];

                return (
                  <div
                    key={`square-${sqNum}`}
                    id={`square-${sqNum}`}
                    data-square={sqNum}
                    className="relative w-full h-full border border-white/10 hover:bg-white/5 transition-colors group"
                  >
                    {/* Question Button inside square */}
                    <button
                      id={`question-btn-${sqNum}`}
                      type="button"
                      onClick={() => onOpenQuestion(sqNum)}
                      aria-label={`Open question for square ${sqNum}`}
                      title={`Square ${sqNum} Question`}
                      className="absolute z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white font-extrabold text-xs sm:text-sm border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-125 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-300"
                      style={{
                        top: '11%',
                        right: sqNum === 10 ? '24%' : '7%',
                        backgroundColor: hasQuestion ? '#18a75b' : iconColor,
                        boxShadow: hasQuestion
                          ? '0 0 10px #22c55e, 0 2px 5px rgba(0,0,0,0.5)'
                          : '0 2px 5px rgba(0,0,0,0.5)',
                      }}
                    >
                      ?
                    </button>

                    {/* Tokens located on this square */}
                    {squarePlayers.map((player, pIdx) => {
                      const clusterStyle = getTokenClusterStyle(pIdx, squarePlayers.length);
                      const isMoving = movingPlayerId === player.id;
                      const isActive = players[activePlayerIndex]?.id === player.id;

                      return (
                        <div
                          key={`token-${player.id}-sq-${sqNum}`}
                          id={`player-token-${player.id}`}
                          className={`absolute z-20 top-1/2 left-1/2 rounded-full border-2 border-white flex items-center justify-center font-black text-white shadow-[0_4px_10px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.6)] select-none transition-all duration-250 ${
                            isMoving ? 'animate-hop scale-110 z-30' : ''
                          } ${isActive ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-black/50' : ''}`}
                          style={{
                            ...clusterStyle,
                            width: 'clamp(24px, 4vw, 40px)',
                            height: 'clamp(24px, 4vw, 40px)',
                            backgroundColor: player.color,
                            fontSize: 'clamp(11px, 1.6vw, 16px)',
                          }}
                          title={`${player.name} (Position: ${player.position})`}
                        >
                          {player.isCpu ? 'C' : player.id}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Starting Dock directly below board */}
      <div
        id="starting-dock"
        aria-label="Starting Dock"
        className="mt-3 w-full max-w-[min(90vw,680px)] sm:max-w-[620px] md:max-w-[680px] bg-gradient-to-r from-[#07193b] via-[#0c2a5e] to-[#07193b] border-2 border-[#1878ee]/60 rounded-xl px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300 font-extrabold text-xs sm:text-sm tracking-wider uppercase">
            Starting Dock (Square 0)
          </span>
        </div>

        {/* Tokens in dock */}
        <div className="flex items-center gap-2 min-h-[36px]">
          {dockPlayers.length === 0 ? (
            <span className="text-slate-400 text-xs italic">All players have entered the board!</span>
          ) : (
            dockPlayers.map((player) => (
              <div
                key={`dock-token-${player.id}`}
                className="relative rounded-full border-2 border-white flex items-center justify-center font-black text-white shadow-[0_3px_8px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.6)] select-none transition-transform hover:scale-110"
                style={{
                  width: 'clamp(26px, 3.8vw, 36px)',
                  height: 'clamp(26px, 3.8vw, 36px)',
                  backgroundColor: player.color,
                  fontSize: 'clamp(11px, 1.5vw, 15px)',
                }}
                title={`${player.name} in starting dock`}
              >
                {player.isCpu ? 'C' : player.id}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
