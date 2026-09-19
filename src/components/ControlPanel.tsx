import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { AVATAR_BASE64, RAW_AVATAR_URL } from '../assetsData';

interface ControlPanelProps {
  players: Player[];
  activePlayerIndex: number;
  statusText: string;
  isBusy: boolean;
  diceValue: number;
  isRolling: boolean;
  pendingMove: number | null;
  onRollDice: () => void;
  onConfirmMove: () => void;
  diceRotation: { x: number; y: number };
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  players,
  activePlayerIndex,
  statusText,
  isBusy,
  diceValue,
  isRolling,
  pendingMove,
  onRollDice,
  onConfirmMove,
  diceRotation,
}) => {
  const activePlayer = players[activePlayerIndex];
  const isCpu = activePlayer?.isCpu;

  // Dice face pips layout helper
  const renderPips = (val: number) => {
    switch (val) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="pip pip-center" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-2.5">
            <span className="pip self-start" />
            <span className="pip self-end" />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-2.5">
            <span className="pip self-start" />
            <span className="pip self-center" />
            <span className="pip self-end" />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 p-2.5 place-items-center">
            <span className="pip" />
            <span className="pip" />
            <span className="pip" />
            <span className="pip" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-2.5">
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 place-items-center">
              <span className="pip" />
              <span className="pip" />
              <span className="pip" />
              <span className="pip" />
            </div>
            <span className="pip absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-2 place-items-center">
            <span className="pip" />
            <span className="pip" />
            <span className="pip" />
            <span className="pip" />
            <span className="pip" />
            <span className="pip" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <aside
      aria-label="Game Controls"
      className="w-full max-w-[340px] flex flex-col items-center select-none"
    >
      {/* Cream Control Panel with Cyan Border & Royal-Blue Outer Ring */}
      <div
        id="control-panel-box"
        className="w-full rounded-[24px] p-5 shadow-[0_12px_36px_rgba(0,18,50,0.6)] border-4 border-[#00e5ff] relative"
        style={{
          backgroundColor: '#fdfbf5',
          boxShadow: '0 0 0 4px #0876ed, 0 16px 36px rgba(0, 15, 50, 0.65)',
        }}
      >
        {/* CURRENT TURN header */}
        <div className="text-center pb-3 border-b-2 border-slate-200">
          <div className="text-xs font-black tracking-widest text-[#08439f] uppercase mb-1">
            CURRENT TURN
          </div>
          <div
            className="text-xl sm:text-2xl font-black truncate px-2 py-0.5 rounded-lg inline-block"
            style={{
              color: activePlayer ? activePlayer.color : '#0f172a',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {activePlayer ? activePlayer.name : 'P1'}
          </div>
        </div>

        {/* Turn Status */}
        <div
          id="turn-status-text"
          className="mt-3 text-center min-h-[38px] flex items-center justify-center font-bold text-sm sm:text-base text-slate-700 px-2 bg-amber-50/80 rounded-lg border border-amber-200/60"
          role="status"
          aria-live="polite"
        >
          {statusText}
        </div>

        {/* Dice Area: Side Avatar on left, 3D stationary dice on right */}
        <div className="mt-4 flex items-center justify-center gap-4 py-2">
          {/* Avatar with 3 animated floating question marks */}
          <div className="flex flex-col items-center">
            {/* Animated bouncing question marks */}
            <div className="flex items-center gap-1 mb-1.5 h-6">
              <span className="text-amber-500 font-extrabold text-sm animate-bounce" style={{ animationDelay: '0ms' }}>?</span>
              <span className="text-cyan-500 font-extrabold text-base animate-bounce" style={{ animationDelay: '150ms' }}>?</span>
              <span className="text-purple-500 font-extrabold text-sm animate-bounce" style={{ animationDelay: '300ms' }}>?</span>
            </div>

            {/* Avatar Image Box */}
            <div className="w-[78px] h-[78px] rounded-2xl overflow-hidden border-2 border-[#1878ee] shadow-md bg-gradient-to-br from-cyan-100 to-blue-200 p-0.5">
              <img
                src={AVATAR_BASE64 || RAW_AVATAR_URL}
                alt="Friendly Game Snake Character"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
          </div>

          {/* Stationary 96x96px 3D Dice Button */}
          <div className="flex flex-col items-center">
            <button
              id="dice-roller-btn"
              type="button"
              onClick={onRollDice}
              disabled={isBusy || pendingMove !== null}
              aria-label={`Dice showing ${diceValue}. Click to roll.`}
              title={
                pendingMove !== null
                  ? 'Click Move Spaces button to proceed'
                  : 'Click to roll dice!'
              }
              className={`stationary-dice-btn relative w-[96px] h-[96px] flex items-center justify-center rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400 cursor-pointer transition-all ${
                isBusy || pendingMove !== null
                  ? 'opacity-80 cursor-not-allowed'
                  : 'hover:scale-105 active:scale-95 animate-pulse'
              }`}
            >
              {/* 3D Cube Container */}
              <div
                className={`dice-cube ${isRolling ? 'rolling' : ''}`}
                style={{
                  transform: `rotateX(${diceRotation.x}deg) rotateY(${diceRotation.y}deg)`,
                }}
              >
                {/* 6 Faces of the 3D Cube */}
                <div className="dice-face face-front">{renderPips(1)}</div>
                <div className="dice-face face-back">{renderPips(6)}</div>
                <div className="dice-face face-right">{renderPips(3)}</div>
                <div className="dice-face face-left">{renderPips(4)}</div>
                <div className="dice-face face-top">{renderPips(2)}</div>
                <div className="dice-face face-bottom">{renderPips(5)}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Move space button appears after rolling (Manual control for all players) */}
        {pendingMove !== null && (
          <div className="mt-3 flex justify-center">
            <button
              id="confirm-move-btn"
              type="button"
              onClick={onConfirmMove}
              aria-label={`تحريك ${activePlayer ? activePlayer.name : ''} ${pendingMove} خطوات`}
              className="w-full py-2.5 px-4 rounded-xl font-black text-white text-base sm:text-lg tracking-wide shadow-lg transition-all duration-200 animate-pulse hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-300"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 15px rgba(16,185,129,0.5)',
              }}
            >
              تحريك {activePlayer ? activePlayer.name : ''} ({pendingMove} {pendingMove === 1 ? 'خطوة' : 'خطوات'}) ▶
            </button>
          </div>
        )}

        {/* Player List and Trophy Counters */}
        <div className="mt-5 pt-3 border-t-2 border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Players & Trophies
          </div>
          <div className="flex flex-col gap-2">
            {players.map((p, idx) => {
              const isActive = idx === activePlayerIndex;
              return (
                <div
                  key={`scoreboard-player-${p.id}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-100/90 shadow-md border-2'
                      : 'bg-white/90 border border-slate-200 hover:bg-slate-50'
                  }`}
                  style={{
                    borderColor: isActive ? p.color : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span
                      className={`text-sm truncate ${
                        isActive ? 'font-black text-slate-900' : 'font-semibold text-slate-700'
                      }`}
                    >
                      {p.name} {p.isCpu ? '(CPU)' : ''}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1 font-extrabold text-sm px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900"
                    title={`Square: ${p.position}, Trophies: ${p.trophies}/5`}
                  >
                    <span>🏆</span>
                    <span>{p.trophies}/5</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer School Signature / Credits as requested by the user in Arabic:
          المديرة : جواهر آل بلابل
          مشرفة المسار المصري : د. هبة حسنين
          المعلمة : صفاء حمدان
          الصف : الرابع الابتدائي
      */}
      <div
        id="footer-signature"
        className="mt-5 w-full text-center px-3 py-3 rounded-2xl bg-[#091f48]/80 border border-amber-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-sm"
        dir="rtl"
      >
        <div className="text-sm font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1.5 mb-1">
          <span>✨</span>
          <span>مدارس جيل المعارف العالمية - المسار المصري</span>
          <span>✨</span>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs mt-2 border-t border-cyan-500/20 pt-2 text-slate-200">
          <div className="text-right">
            <span className="text-cyan-300 font-semibold">المديرة: </span>
            <span className="font-bold text-amber-200">جواهر آل بلابل</span>
          </div>
          <div className="text-right">
            <span className="text-cyan-300 font-semibold">مشرفة المسار: </span>
            <span className="font-bold text-amber-200">د. هبة حسنين</span>
          </div>
          <div className="text-right">
            <span className="text-cyan-300 font-semibold">المعلمة: </span>
            <span className="font-bold text-amber-200">صفاء حمدان</span>
          </div>
          <div className="text-right">
            <span className="text-cyan-300 font-semibold">الصف: </span>
            <span className="font-bold text-emerald-300">الرابع الابتدائي</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
