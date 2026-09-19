import React, { useState, useEffect, useRef } from 'react';
import {
  GameMode,
  Player,
  QuestionRecord,
  BannerEvent,
  WinnerInfo,
  PLAYER_COLORS,
  LADDERS,
  SNAKES,
  DEFAULT_QUESTIONS,
} from './types';
import {
  setSoundEnabled,
  isSoundEnabled,
  playStepSound,
  playRollSound,
  playLadderSound,
  playSnakeSound,
  playBlockedSound,
} from './audio';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { ControlPanel } from './components/ControlPanel';
import { SettingsModal } from './components/SettingsModal';
import { QuestionModal } from './components/QuestionModal';
import { VictoryOverlay } from './components/VictoryOverlay';
import { ShareDownloadModal } from './components/ShareDownloadModal';

export default function App() {
  // Sound state
  const [soundActive, setSoundActive] = useState(true);

  // Settings & share modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [mode, setMode] = useState<GameMode>('local');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['اللاعب 1', 'اللاعب 2']);

  // Questions (exactly 20 records)
  const [questions, setQuestions] = useState<QuestionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('snakeTrailQuestions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 20) {
          return parsed;
        }
      }
    } catch {
      // ignore corrupt storage
    }
    return DEFAULT_QUESTIONS;
  });

  // Players state - default to 2 human players (local)
  const [players, setPlayers] = useState<Player[]>(() => {
    return [
      { id: 1, name: 'اللاعب 1', color: PLAYER_COLORS[0], position: 0, trophies: 0, earnedSquares: [], isCpu: false },
      { id: 2, name: 'اللاعب 2', color: PLAYER_COLORS[1], position: 0, trophies: 0, earnedSquares: [], isCpu: false },
    ];
  });

  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);

  // Dice & Turn state
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [diceRotation, setDiceRotation] = useState<{ x: number; y: number }>({ x: -12, y: 16 });
  const [pendingMove, setPendingMove] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [movingPlayerId, setMovingPlayerId] = useState<number | null>(null);

  // Status & Announcements
  const [statusText, setStatusText] = useState<string>('دور اللاعب 1: اضغط على النرد لرميه 🎲');
  const [bannerEvent, setBannerEvent] = useState<BannerEvent | null>(null);

  // Active question modal
  const [activeQuestionSquare, setActiveQuestionSquare] = useState<number | null>(null);

  // Winner state
  const [winner, setWinner] = useState<WinnerInfo | null>(null);

  // Load saved names from localStorage on initial load
  useEffect(() => {
    try {
      const savedNames = localStorage.getItem('snakeTrailNames');
      if (savedNames) {
        const parsed = JSON.parse(savedNames);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPlayerNames(parsed);
          setPlayers((prev) =>
            prev.map((p, idx) => ({
              ...p,
              name: p.isCpu ? 'CPU' : parsed[idx] || `P${idx + 1}`,
            }))
          );
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const activePlayer = players[activePlayerIndex];

  // Helper to get dice rotation angles for a face (1-6) plus resting tilt and rotations
  const calculateDiceRotation = (faceVal: number) => {
    const faceAngles: Record<number, { x: number; y: number }> = {
      1: { x: 0, y: 0 },
      2: { x: -90, y: 0 },
      3: { x: 0, y: -90 },
      4: { x: 0, y: 90 },
      5: { x: 90, y: 0 },
      6: { x: 0, y: 180 },
    };
    const base = faceAngles[faceVal] || { x: 0, y: 0 };
    // Add multiple spins (1080 deg) + slight resting tilt: -12deg X, +16deg Y
    return {
      x: base.x - 12 + 1080,
      y: base.y + 16 + 720,
    };
  };

  // Sound toggle handler
  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
  };

  // Roll dice action
  const handleRollDice = () => {
    if (isRolling || isMoving || winner || pendingMove !== null) return;

    setIsRolling(true);
    playRollSound();

    const rolled = Math.floor(Math.random() * 6) + 1;
    setDiceValue(rolled);
    setDiceRotation(calculateDiceRotation(rolled));

    setStatusText(`${activePlayer.name} rolling dice...`);

    setTimeout(() => {
      setIsRolling(false);
      setStatusText(`حصل ${activePlayer.name} على الرقم (${rolled})! اضغط على زر التحريك بالأسفل.`);
      // ALWAYS require human confirmation click to move
      setPendingMove(rolled);
    }, 1000);
  };

  // Human clicks "Move N spaces"
  const handleConfirmMove = () => {
    if (pendingMove === null || isMoving || winner) return;
    const steps = pendingMove;
    setPendingMove(null);
    executeMovement(activePlayer.id, steps);
  };

  // Movement execution: step by step hop, check exact 20, check ladders & snakes
  const executeMovement = async (playerId: number, steps: number) => {
    setIsMoving(true);
    setMovingPlayerId(playerId);

    const player = players.find((p) => p.id === playerId);
    if (!player) {
      setIsMoving(false);
      setMovingPlayerId(null);
      return;
    }

    const currentPos = player.position;
    const targetPos = currentPos + steps;

    // Rule: Roll exceeding 20 stays put
    if (targetPos > 20) {
      playBlockedSound();
      setStatusText(`${player.name} needs an exact roll. The token stays put.`);
      setBannerEvent({
        type: 'overshoot',
        player: player.name,
        message: `${player.name} needs an exact roll to reach 20. Token stays put!`,
      });

      await new Promise((res) => setTimeout(res, 1800));
      setBannerEvent(null);
      setIsMoving(false);
      setMovingPlayerId(null);
      passTurn();
      return;
    }

    // Step-by-step movement animation
    for (let pos = currentPos + 1; pos <= targetPos; pos++) {
      playStepSound();
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, position: pos } : p))
      );
      setStatusText(`${player.name} moving to square ${pos}...`);
      await new Promise((res) => setTimeout(res, 280));
    }

    // Check if reached square 20 exactly
    if (targetPos === 20) {
      setWinner({
        player: { ...player, position: 20 },
        reason: 'reached square 20 exactly',
      });
      setIsMoving(false);
      setMovingPlayerId(null);
      return;
    }

    // Check for Ladders
    if (LADDERS[targetPos]) {
      const dest = LADDERS[targetPos];
      playLadderSound();
      setStatusText(`Ladder! ${player.name} climbs to square ${dest}.`);
      setBannerEvent({
        type: 'ladder',
        player: player.name,
        from: targetPos,
        to: dest,
        message: `🪜 Ladder! ${player.name} climbs from square ${targetPos} up to square ${dest}!`,
      });

      await new Promise((res) => setTimeout(res, 500));
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, position: dest } : p))
      );

      await new Promise((res) => setTimeout(res, 1400));
      setBannerEvent(null);

      if (dest === 20) {
        setWinner({
          player: { ...player, position: 20 },
          reason: 'climbed a ladder to square 20',
        });
        setIsMoving(false);
        setMovingPlayerId(null);
        return;
      }
    }
    // Check for Snakes
    else if (SNAKES[targetPos]) {
      const dest = SNAKES[targetPos];
      playSnakeSound();
      setStatusText(`Oh no! A snake bites ${player.name} and slides down to square ${dest}.`);
      setBannerEvent({
        type: 'snake',
        player: player.name,
        from: targetPos,
        to: dest,
        message: `🐍 Oh no! A snake bites ${player.name} and slides the token down to square ${dest}!`,
      });

      await new Promise((res) => setTimeout(res, 500));
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, position: dest } : p))
      );

      await new Promise((res) => setTimeout(res, 1400));
      setBannerEvent(null);
    }

    setIsMoving(false);
    setMovingPlayerId(null);
    passTurn();
  };

  // Pass turn to next player - NEVER auto-rolls! Always awaits click on dice
  const passTurn = () => {
    setActivePlayerIndex((prev) => {
      const nextIdx = (prev + 1) % players.length;
      const nextPlayer = players[nextIdx];
      setStatusText(`حان دور ${nextPlayer.name}! اضغط على النرد لرميه 🎲`);
      return nextIdx;
    });
  };

  // Open question modal (allowed for any active player when not busy)
  const handleOpenQuestion = (squareNum: number) => {
    if (isMoving || isRolling || winner) return;
    setActiveQuestionSquare(squareNum);
  };

  // Award trophy on correct answer
  const handleAwardTrophy = (playerId: number, squareNum: number) => {
    setPlayers((prev) => {
      return prev.map((p) => {
        if (p.id === playerId) {
          const newEarned = [...p.earnedSquares, squareNum];
          const newTrophies = p.trophies + 1;

          // Check 5 trophies win condition
          if (newTrophies >= 5) {
            setTimeout(() => {
              setActiveQuestionSquare(null);
              setPlayers((cur) =>
                cur.map((cp) => (cp.id === playerId ? { ...cp, position: 20 } : cp))
              );
              setWinner({
                player: { ...p, trophies: newTrophies, position: 20 },
                reason: 'collected five trophies!',
              });
            }, 800);
          }

          return {
            ...p,
            trophies: newTrophies,
            earnedSquares: newEarned,
          };
        }
        return p;
      });
    });
  };

  // Save mode, player count & names from Settings
  const handleSaveModeAndPlayers = (newMode: GameMode, newCount: number, newNames: string[]) => {
    setMode(newMode);
    setPlayerCount(newCount);
    setPlayerNames(newNames);

    const count = newMode === 'vs-cpu' ? 2 : newCount;
    const newPlayers: Player[] = Array.from({ length: count }, (_, idx) => {
      const isCpu = newMode === 'vs-cpu' && idx === 1;
      return {
        id: idx + 1,
        name: isCpu ? 'الكمبيوتر (CPU)' : newNames[idx] || `اللاعب ${idx + 1}`,
        color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
        position: 0,
        trophies: 0,
        earnedSquares: [],
        isCpu,
      };
    });

    setPlayers(newPlayers);
    setActivePlayerIndex(0);
    setPendingMove(null);
    setWinner(null);
    setStatusText(`تم حفظ الإعدادات! دور ${newPlayers[0]?.name}: اضغط على النرد لرميه 🎲`);
  };

  // Save questions
  const handleSaveQuestions = (newQuestions: QuestionRecord[]) => {
    setQuestions(newQuestions);
  };

  // Restart game: reset positions, turns, trophies, without erasing settings
  const handleRestartGame = () => {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        position: 0,
        trophies: 0,
        earnedSquares: [],
      }))
    );
    setActivePlayerIndex(0);
    setPendingMove(null);
    setIsMoving(false);
    setIsRolling(false);
    setBannerEvent(null);
    setWinner(null);
    setActiveQuestionSquare(null);
    setStatusText('Game restarted! All players in starting dock.');
  };

  // Trigger download of standalone HTML file reliably
  const handleDownloadStandaloneHtml = async () => {
    try {
      const response = await fetch('/snake-learning-game-latest-edition.html');
      if (!response.ok) throw new Error('File fetch error');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'snake-learning-game-latest-edition.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch {
      // Direct window fallback
      window.open('/snake-learning-game-latest-edition.html', '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#050d24] via-[#0a1f4d] to-[#051438] text-white">
      {/* Top Header */}
      <Header
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onDownloadHtml={handleDownloadStandaloneHtml}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1320px] mx-auto px-3 sm:px-4 py-3 sm:py-5 flex flex-col items-center">
        {/* Navigation Action Buttons above board */}
        <div className="w-full flex items-center justify-between gap-2 max-w-[min(90vw,680px)] sm:max-w-[620px] md:max-w-[1040px] mb-3 flex-wrap">
          <button
            id="back-to-settings-btn"
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Back to settings screen"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white border border-cyan-400/50 shadow-md active:scale-95 transition-all"
          >
            <span>← الإعدادات Settings</span>
          </button>

          {/* Quick Share / Download Game Button */}
          <button
            id="quick-share-download-btn"
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            aria-label="تحميل ومشاركة اللعبة"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-300/60 shadow-[0_0_12px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
          >
            <span>📥 تحميل ومشاركة اللعبة</span>
          </button>

          <button
            id="restart-game-btn"
            type="button"
            onClick={handleRestartGame}
            aria-label="Restart current game"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border border-amber-300/50 shadow-md active:scale-95 transition-all"
          >
            <span>↻ إعادة اللعبة Restart</span>
          </button>
        </div>

        {/* Responsive Layout: Board on left, Control Panel on right; stacks on mobile/tablet <=850px */}
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8">
          {/* Board Column */}
          <div className="flex-1 flex justify-center w-full max-w-[720px]">
            <Board
              players={players}
              activePlayerIndex={activePlayerIndex}
              questions={questions}
              onOpenQuestion={handleOpenQuestion}
              bannerEvent={bannerEvent}
              movingPlayerId={movingPlayerId}
            />
          </div>

          {/* Control Column (Sticky on desktop, stacked below on <=850px) */}
          <div className="w-full lg:w-[320px] flex justify-center lg:sticky lg:top-4">
            <ControlPanel
              players={players}
              activePlayerIndex={activePlayerIndex}
              statusText={statusText}
              isBusy={isRolling || isMoving}
              diceValue={diceValue}
              isRolling={isRolling}
              pendingMove={pendingMove}
              onRollDice={handleRollDice}
              onConfirmMove={handleConfirmMove}
              diceRotation={diceRotation}
            />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        mode={mode}
        playerCount={playerCount}
        playerNames={playerNames}
        questions={questions}
        onSaveModeAndPlayers={handleSaveModeAndPlayers}
        onSaveQuestions={handleSaveQuestions}
        onStartGame={() => setIsSettingsOpen(false)}
        onClose={() => setIsSettingsOpen(false)}
        onDownloadHtml={handleDownloadStandaloneHtml}
        onOpenShareModal={() => {
          setIsSettingsOpen(false);
          setIsShareModalOpen(true);
        }}
      />

      {/* Share and Download Modal */}
      <ShareDownloadModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onDownloadHtml={handleDownloadStandaloneHtml}
      />

      {/* Question Modal */}
      <QuestionModal
        squareNumber={activeQuestionSquare}
        questionRecord={
          activeQuestionSquare !== null ? questions[activeQuestionSquare - 1] : undefined
        }
        activePlayer={activePlayer}
        onClose={() => setActiveQuestionSquare(null)}
        onAwardTrophy={handleAwardTrophy}
      />

      {/* Victory Overlay */}
      {winner && (
        <VictoryOverlay
          winner={winner.player}
          reason={winner.reason}
          onPlayAgain={handleRestartGame}
        />
      )}
    </div>
  );
}
