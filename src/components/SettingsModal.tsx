import React, { useState, useEffect } from 'react';
import { Download, Share2 } from 'lucide-react';
import { GameMode, QuestionRecord, PLAYER_COLORS } from '../types';
import { playSaveSound } from '../audio';

interface SettingsModalProps {
  isOpen: boolean;
  mode: GameMode;
  playerCount: number;
  playerNames: string[];
  questions: QuestionRecord[];
  onSaveModeAndPlayers: (mode: GameMode, count: number, names: string[]) => void;
  onSaveQuestions: (questions: QuestionRecord[]) => void;
  onStartGame: () => void;
  onClose?: () => void;
  onDownloadHtml?: () => void;
  onOpenShareModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  mode: initialMode,
  playerCount: initialCount,
  playerNames: initialNames,
  questions: initialQuestions,
  onSaveModeAndPlayers,
  onSaveQuestions,
  onStartGame,
  onClose,
  onDownloadHtml,
  onOpenShareModal,
}) => {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [playerCount, setPlayerCount] = useState<number>(initialCount);
  const [names, setNames] = useState<string[]>(initialNames);
  const [namesSaveStatus, setNamesSaveStatus] = useState<string>('');

  // Questions state
  const [questionsList, setQuestionsList] = useState<QuestionRecord[]>(initialQuestions);
  const [bulkQuestionsText, setBulkQuestionsText] = useState<string>('');
  const [bulkAnswersText, setBulkAnswersText] = useState<string>('');
  const [bulkStatus, setBulkStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Single-square question state
  const [selectedSquare, setSelectedSquare] = useState<number>(1);
  const [singleQ, setSingleQ] = useState<string>('');
  const [singleA, setSingleA] = useState<string>('');
  const [singleStatus, setSingleStatus] = useState<string>('');

  // Synchronize when opened
  useEffect(() => {
    setMode(initialMode);
    setPlayerCount(initialCount);
    setNames(initialNames);
    setQuestionsList(initialQuestions);

    // Populate bulk text areas with existing questions
    const qLines = initialQuestions.map((q) => q.q);
    const aLines = initialQuestions.map((q) => q.a);
    setBulkQuestionsText(qLines.join('\n'));
    setBulkAnswersText(aLines.join('\n'));

    // Populate square 1
    if (initialQuestions[0]) {
      setSingleQ(initialQuestions[0].q);
      setSingleA(initialQuestions[0].a);
    }
  }, [isOpen, initialMode, initialCount, initialNames, initialQuestions]);

  // When selectedSquare changes, update single inputs
  useEffect(() => {
    const qRec = questionsList[selectedSquare - 1] || { q: '', a: '' };
    setSingleQ(qRec.q);
    setSingleA(qRec.a);
    setSingleStatus('');
  }, [selectedSquare, questionsList]);

  if (!isOpen) return null;

  const handleNameChange = (idx: number, val: string) => {
    const updated = [...names];
    updated[idx] = val.slice(0, 22);
    setNames(updated);
    setNamesSaveStatus('Unsaved changes');
  };

  const handleSaveNames = () => {
    // Fill blank names with اللاعب 1, اللاعب 2... or CPU
    const finalNames = names.map((nm, idx) => {
      if (mode === 'vs-cpu' && idx === 1) return 'الكمبيوتر (CPU)';
      return nm.trim() || `اللاعب ${idx + 1}`;
    });
    setNames(finalNames);
    localStorage.setItem('snakeTrailNames', JSON.stringify(finalNames));
    onSaveModeAndPlayers(mode, playerCount, finalNames);
    setNamesSaveStatus(`✓ تم حفظ أسماء ${mode === 'vs-cpu' ? 2 : playerCount} لاعبين`);
    playSaveSound();
  };

  const handleApplyBulk = () => {
    const qLines = bulkQuestionsText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const aLines = bulkAnswersText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (qLines.length !== aLines.length) {
      setBulkStatus({
        type: 'error',
        text: `Line count mismatch: ${qLines.length} questions and ${aLines.length} answers. Counts must be equal!`,
      });
      return;
    }

    if (qLines.length === 0) {
      setBulkStatus({
        type: 'error',
        text: 'Please enter at least 1 question and answer.',
      });
      return;
    }

    if (qLines.length > 20) {
      setBulkStatus({
        type: 'error',
        text: `Max 20 questions allowed (entered ${qLines.length}).`,
      });
      return;
    }

    // Build exactly 20 records
    const newRecords: QuestionRecord[] = [];
    for (let i = 0; i < 20; i++) {
      if (i < qLines.length) {
        newRecords.push({ q: qLines[i], a: aLines[i] });
      } else {
        newRecords.push({ q: '', a: '' });
      }
    }

    setQuestionsList(newRecords);
    localStorage.setItem('snakeTrailQuestions', JSON.stringify(newRecords));
    onSaveQuestions(newRecords);
    setBulkStatus({
      type: 'success',
      text: `✓ Successfully saved ${qLines.length} questions (assigned to squares 1–${qLines.length})!`,
    });
    playSaveSound();
  };

  const handleSaveSingleSquare = () => {
    const updated = [...questionsList];
    while (updated.length < 20) {
      updated.push({ q: '', a: '' });
    }
    updated[selectedSquare - 1] = { q: singleQ.trim(), a: singleA.trim() };
    setQuestionsList(updated);
    localStorage.setItem('snakeTrailQuestions', JSON.stringify(updated));
    onSaveQuestions(updated);
    setSingleStatus(`✓ Square ${selectedSquare} saved!`);
    playSaveSound();
  };

  const handleClearSingleSquare = () => {
    const updated = [...questionsList];
    while (updated.length < 20) {
      updated.push({ q: '', a: '' });
    }
    updated[selectedSquare - 1] = { q: '', a: '' };
    setSingleQ('');
    setSingleA('');
    setQuestionsList(updated);
    localStorage.setItem('snakeTrailQuestions', JSON.stringify(updated));
    onSaveQuestions(updated);
    setSingleStatus(`✓ Square ${selectedSquare} cleared.`);
    playSaveSound();
  };

  const handleStart = () => {
    // Ensure names are saved
    const effectiveCount = mode === 'vs-cpu' ? 2 : playerCount;
    const finalNames = names.slice(0, effectiveCount).map((nm, idx) => {
      if (mode === 'vs-cpu' && idx === 1) return 'CPU';
      return nm.trim() || `P${idx + 1}`;
    });
    localStorage.setItem('snakeTrailNames', JSON.stringify(finalNames));
    onSaveModeAndPlayers(mode, effectiveCount, finalNames);
    onStartGame();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-heading"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#091b3e] via-[#0c2452] to-[#08152e] rounded-3xl border-2 border-cyan-400/60 shadow-[0_0_50px_rgba(2,132,199,0.5)] p-5 sm:p-7 text-white max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="text-center pb-4 border-b border-cyan-500/30">
          <h2 id="settings-heading" className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide">
            Set up your game
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-1">
            Choose how to play, save the player names, and add your learning questions.
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-6 py-4 flex-1">
          {/* Section 1: Play Modes */}
          <div>
            <label className="block text-cyan-300 font-extrabold text-sm uppercase tracking-wider mb-2.5">
              طريقة اللعب (Game Mode)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Various Players (Default) */}
              <button
                type="button"
                onClick={() => {
                  setMode('local');
                  setNamesSaveStatus('Unsaved changes');
                }}
                aria-pressed={mode === 'local'}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  mode === 'local'
                    ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.4)] ring-2 ring-amber-300'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
                }`}
              >
                <div className="text-lg font-black text-white flex items-center gap-2">
                  <span>👥 لاعبين / طلاب (Various Players)</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  من 2 إلى 5 طلاب في الفصل بالتبادل - تحكم يدوي كامل بالنرد والقطع.
                </div>
              </button>

              {/* Versus Computer */}
              <button
                type="button"
                onClick={() => {
                  setMode('vs-cpu');
                  setPlayerCount(2);
                  setNamesSaveStatus('Unsaved changes');
                }}
                aria-pressed={mode === 'vs-cpu'}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  mode === 'vs-cpu'
                    ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.4)] ring-2 ring-amber-300'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
                }`}
              >
                <div className="text-lg font-black text-white flex items-center gap-2">
                  <span>🤖 ضد الكمبيوتر (Versus Computer)</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  طالب يلعب ضد الكمبيوتر مع الضغط اليدوي على النرد لكل دور.
                </div>
              </button>
            </div>

            {/* Local player count selector */}
            {mode === 'local' && (
              <div className="mt-3 bg-slate-900/50 p-3 rounded-xl border border-cyan-500/30 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-200">Number of players:</span>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map((cnt) => (
                    <button
                      key={`cnt-btn-${cnt}`}
                      type="button"
                      onClick={() => {
                        setPlayerCount(cnt);
                        setNamesSaveStatus('Unsaved changes');
                      }}
                      className={`w-10 h-10 rounded-xl font-black text-base border transition-all ${
                        playerCount === cnt
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-105'
                          : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Player Names */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <label className="text-cyan-300 font-extrabold text-sm uppercase tracking-wider">
                Player Names (Max 22 chars)
              </label>
              {namesSaveStatus && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    namesSaveStatus.startsWith('✓')
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                      : 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                  }`}
                >
                  {namesSaveStatus}
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {Array.from({ length: mode === 'vs-cpu' ? 2 : playerCount }).map((_, idx) => {
                const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
                const isCpuField = mode === 'vs-cpu' && idx === 1;

                return (
                  <div key={`player-name-row-${idx}`} className="flex items-center gap-2.5">
                    <span
                      className="w-7 h-7 rounded-full border border-white flex items-center justify-center text-xs font-black text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {isCpuField ? 'C' : idx + 1}
                    </span>
                    <input
                      type="text"
                      maxLength={22}
                      disabled={isCpuField}
                      value={isCpuField ? 'CPU' : names[idx] ?? ''}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      placeholder={`Player ${idx + 1} (leave blank for P${idx + 1})`}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                id="save-player-names-btn"
                type="button"
                onClick={handleSaveNames}
                className="px-4 py-2 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all border border-emerald-300/40"
              >
                Save player names
              </button>
            </div>
          </div>

          {/* Section 3: Question Editor (Collapsible details) */}
          <details className="bg-slate-900/60 rounded-2xl border border-cyan-500/30 overflow-hidden group">
            <summary className="p-4 font-black text-cyan-300 text-sm sm:text-base cursor-pointer hover:text-cyan-200 flex items-center justify-between select-none">
              <span>📚 Add or edit my questions (Squares 1–20)</span>
              <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>

            <div className="p-4 pt-2 border-t border-cyan-500/20 space-y-4">
              {/* Bulk Import */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Bulk Import (Equal line counts, lines 1–20 map to squares 1–20)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Questions, one per line:
                    </label>
                    <textarea
                      rows={5}
                      value={bulkQuestionsText}
                      onChange={(e) => setBulkQuestionsText(e.target.value)}
                      placeholder="Line 1: Question for Square 1&#10;Line 2: Question for Square 2..."
                      className="w-full p-2.5 rounded-xl bg-slate-800/90 border border-slate-600 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Answers, one per line:
                    </label>
                    <textarea
                      rows={5}
                      value={bulkAnswersText}
                      onChange={(e) => setBulkAnswersText(e.target.value)}
                      placeholder="Line 1: Answer for Square 1&#10;Line 2: Answer for Square 2..."
                      className="w-full p-2.5 rounded-xl bg-slate-800/90 border border-slate-600 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                    />
                  </div>
                </div>

                {bulkStatus && (
                  <div
                    className={`text-xs font-bold p-2 rounded-xl ${
                      bulkStatus.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                    }`}
                  >
                    {bulkStatus.text}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleApplyBulk}
                  className="px-4 py-1.5 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow transition-all active:scale-95"
                >
                  Apply bulk questions
                </button>
              </div>

              {/* Single Square Editor */}
              <div className="pt-3 border-t border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Single-square Editor
                  </span>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-slate-300">Square:</label>
                    <select
                      value={selectedSquare}
                      onChange={(e) => setSelectedSquare(Number(e.target.value))}
                      className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((sq) => (
                        <option key={`opt-sq-${sq}`} value={sq}>
                          Square {sq}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={singleQ}
                    onChange={(e) => setSingleQ(e.target.value)}
                    placeholder={`Question for Square ${selectedSquare}...`}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-600 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <input
                    type="text"
                    value={singleA}
                    onChange={(e) => setSingleA(e.target.value)}
                    placeholder={`Exact answer for Square ${selectedSquare}...`}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-600 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {singleStatus && (
                  <div className="text-xs font-bold text-emerald-300">
                    {singleStatus}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveSingleSquare}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95"
                  >
                    Save this square
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSingleSquare}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-700 hover:bg-slate-600 text-rose-300 transition-all active:scale-95"
                  >
                    Clear this square
                  </button>
                </div>
              </div>
            </div>
          </details>

          {/* Section 4: Download & Share Game */}
          <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-blue-950/50 p-4 rounded-2xl border border-emerald-500/40 text-right" dir="rtl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-sm sm:text-base">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>تحميل اللعبة ومشاركتها مع الطلاب</span>
              </div>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                بدون الحاجة لـ GitHub
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              يمكنك الحصول على الرابط المباشر للمشاركة، أو تنزيل ملف اللعبة كاملاً للتشغيل بدون إنترنت:
            </p>
            <div className="flex flex-wrap gap-2">
              {onOpenShareModal && (
                <button
                  type="button"
                  onClick={onOpenShareModal}
                  className="flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm bg-cyan-600 hover:bg-cyan-500 text-white shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>عرض الرابط المباشر للعبة</span>
                </button>
              )}
              {onDownloadHtml && (
                <button
                  type="button"
                  onClick={onDownloadHtml}
                  className="flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل ملف HTML بدون نت</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Start Game full width green button */}
        <div className="pt-4 border-t border-cyan-500/30 flex flex-col gap-2">
          <button
            id="start-game-submit-btn"
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-white text-lg tracking-wider shadow-[0_4px_25px_rgba(16,185,129,0.6)] bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-500 hover:brightness-110 active:scale-[0.98] transition-all border-2 border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            Start the game ▶
          </button>
        </div>
      </div>
    </div>
  );
};
