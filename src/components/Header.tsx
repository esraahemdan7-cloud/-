import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { TITLE_BASE64, RAW_TITLE_URL, SCHOOL_LOGO_BASE64 } from '../assetsData';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="w-full max-w-[1340px] mx-auto px-3 sm:px-4 pt-3 pb-2 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-cyan-500/20">
      {/* Left side: School Logo and Mandatory Title Picture */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 w-full md:w-auto">
        {/* School Logo */}
        <div
          className="relative flex items-center bg-white/95 rounded-xl px-2.5 py-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.3)] border border-amber-300/60 hover:scale-[1.02] transition-transform duration-200"
          title="مدارس جيل المعارف العالمية - المسار المصري"
        >
          <img
            src={SCHOOL_LOGO_BASE64}
            alt="شعار مدارس جيل المعارف العالمية - المسار المصري"
            className="h-10 sm:h-12 w-auto object-contain max-w-[160px] sm:max-w-[200px]"
          />
        </div>

        {/* Mandatory Title Picture */}
        <div className="relative overflow-hidden rounded-lg shadow-[0_6px_20px_rgba(8,30,80,0.6)]">
          <img
            src={TITLE_BASE64 || RAW_TITLE_URL}
            alt="SNAKES AND LADDER"
            className="title-img block object-cover drop-shadow-[0_4px_10px_rgba(4,18,50,0.8)]"
            style={{
              objectPosition: 'left 40%',
            }}
          />
        </div>
      </div>

      {/* Right side: Actions (Sound only) */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
        {/* Sound toggle button */}
        <button
          id="sound-toggle-btn"
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? 'Mute game sound' : 'Unmute game sound'}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 shadow-md border focus:outline-none focus:ring-2 focus:ring-cyan-300 active:scale-95"
          style={{
            background: soundEnabled
              ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
              : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
            color: '#ffffff',
            borderColor: soundEnabled ? '#38bdf8' : '#64748b',
          }}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>🔊 الصوت</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-300" />
              <span>🔇 كتم</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
