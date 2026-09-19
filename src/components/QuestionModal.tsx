import React, { useState, useEffect, useRef } from 'react';
import { Player, QuestionRecord } from '../types';
import { playCorrectSound, playWrongSound, playTrophySound } from '../audio';

interface QuestionModalProps {
  squareNumber: number | null;
  questionRecord?: QuestionRecord;
  activePlayer: Player;
  onClose: () => void;
  onAwardTrophy: (playerId: number, squareNum: number) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  squareNumber,
  questionRecord,
  activePlayer,
  onClose,
  onAwardTrophy,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'info'; message: string } | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserAnswer('');
    setFeedback(null);
    setShake(false);
    if (squareNumber !== null) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [squareNumber]);

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (squareNumber === null) return null;

  const hasQuestion = questionRecord && questionRecord.q.trim().length > 0;
  const isAlreadyEarned = activePlayer.earnedSquares.includes(squareNumber);

  // Normalize string: trim, collapse multiple whitespace into single space, lowercase
  const normalize = (str: string) => {
    return str.trim().replace(/\s+/g, ' ').toLowerCase();
  };

  const handleCheckAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasQuestion) return;

    const normInput = normalize(userAnswer);
    const normTarget = normalize(questionRecord.a);

    if (normInput === normTarget) {
      if (isAlreadyEarned) {
        setFeedback({
          type: 'info',
          message: 'Correct! You already earned the trophy for this square.',
        });
        playCorrectSound();
      } else {
        setFeedback({
          type: 'correct',
          message: 'Correct! Trophy earned! ✨🏆',
        });
        playCorrectSound();
        setTimeout(() => {
          playTrophySound();
        }, 200);
        onAwardTrophy(activePlayer.id, squareNumber);
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      playWrongSound();
      setFeedback({
        type: 'wrong',
        message: 'Not quite—try again. Check spelling and spacing.',
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
    >
      <div
        className={`relative w-full max-w-lg bg-gradient-to-b from-[#0a1e45] to-[#07132e] rounded-3xl border-2 border-cyan-400 p-6 shadow-[0_0_40px_rgba(2,132,199,0.5)] text-white transition-all ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Title */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
          <h3 id="question-modal-title" className="text-xl sm:text-2xl font-black text-amber-300">
            Square {squareNumber} question
          </h3>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{
              borderColor: activePlayer.color,
              color: activePlayer.color,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {activePlayer.name}&apos;s Turn
          </span>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {!hasQuestion ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-200 text-sm font-semibold text-center">
              No question is saved for square {squareNumber} yet. Add it in settings.
            </div>
          ) : (
            <form onSubmit={handleCheckAnswer} className="space-y-4">
              {/* Question text */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-base sm:text-lg font-bold text-cyan-100 leading-relaxed shadow-inner">
                {questionRecord.q}
              </div>

              {/* Already earned notice */}
              {isAlreadyEarned && (
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20">
                  <span>⭐</span>
                  <span>You have already earned a trophy from this square.</span>
                </div>
              )}

              {/* Answer input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Answer:
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border-2 border-slate-600 text-white font-bold text-base focus:outline-none focus:border-cyan-400 shadow-inner"
                />
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl font-bold text-sm text-center border transition-all ${
                    feedback.type === 'correct'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : feedback.type === 'wrong'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-400/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/60'
                  }`}
                  role="status"
                  aria-live="assertive"
                >
                  {feedback.message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all border border-slate-500"
                >
                  Close
                </button>
                <button
                  id="check-answer-submit-btn"
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 border border-emerald-400/50"
                >
                  Check my answer
                </button>
              </div>
            </form>
          )}
        </div>

        {/* If no question, just a close button */}
        {!hasQuestion && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 rounded-xl font-bold text-sm bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
