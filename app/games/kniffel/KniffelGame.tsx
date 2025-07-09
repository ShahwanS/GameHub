import { useState, useEffect } from "react";
import { useRoom } from "~/components/GameLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
// Dice images are served from public directory
const dice1 = "/assets/dice/1.png";
const dice2 = "/assets/dice/2.png";
const dice3 = "/assets/dice/3.png";
const dice4 = "/assets/dice/4.png";
const dice5 = "/assets/dice/5.png";
const dice6 = "/assets/dice/6.png";
import { motion } from "framer-motion";
import type { KniffelGameState, KniffelCategory } from "~/utils/gameState";
import { leaveRoom as leaveRoomSocket } from "~/utils/socketClient";
import { useRoomPersistence } from "~/context/RoomPersistenceContext";
import { useNavigate } from "@remix-run/react";

const UPPER_SCORES = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
] as const;
const LOWER_SCORES = [
  "threeOfAKind",
  "fourOfAKind",
  "fullHouse",
  "smallStraight",
  "largeStraight",
  "kniffel",
  "chance",
] as const;
const DICE_IMAGES = [dice1, dice2, dice3, dice4, dice5, dice6] as const;
const BLANK_SCORE_SHEET = Object.fromEntries(
  [...UPPER_SCORES, ...LOWER_SCORES].map((key) => [key, null])
) as Record<KniffelCategory, number | null>;

export default function KniffelGame() {
  const { players = [], latestState, pushState, playerId, roomId } = useRoom();
  const { setRoomId, setPlayerId } = useRoomPersistence();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedDiceIndices, setSelectedDiceIndices] = useState<number[]>([]);
  const [animatedDiceFaces, setAnimatedDiceFaces] = useState<number[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const gameState = latestState as KniffelGameState | null;

  const currentPlayerIndex = gameState?.currentPlayerIndex ?? -1;
  const currentPlayerId =
    players.length > 0 &&
    currentPlayerIndex >= 0 &&
    currentPlayerIndex < players.length
      ? players[currentPlayerIndex]?.id
      : null;
  const isMyTurn = playerId === currentPlayerId;

  // --- 2. Helper Functions ---
  const computeUpperSum = (scores?: Record<KniffelCategory, number | null>) =>
    UPPER_SCORES.reduce((sum, cat) => sum + (scores?.[cat] ?? 0), 0);
  const computeLowerSum = (scores?: Record<KniffelCategory, number | null>) =>
    LOWER_SCORES.reduce((sum, cat) => sum + (scores?.[cat] ?? 0), 0);
  const randomDie = () => Math.floor(Math.random() * 6) + 1;

  // Check if a player has any available categories to score
  const hasAvailableCategories = (playerId: string): boolean => {
    if (!gameState) return false;
    const playerScores = gameState.scores[playerId] ?? BLANK_SCORE_SHEET;
    return [...UPPER_SCORES, ...LOWER_SCORES].some(
      (cat) => playerScores[cat] === null
    );
  };

  // Get the next player who still has categories to fill
  const getNextPlayerIndex = (currentIndex: number): number => {
    if (players.length === 0) return 0;
    if (players.length === 1) return 0;

    let nextIndex = (currentIndex + 1) % players.length;
    let attempts = 0;

    // Keep looking for a player with available categories
    while (attempts < players.length) {
      // Ensure the index is within bounds
      if (nextIndex >= players.length) {
        nextIndex = 0;
      }

      const nextPlayer = players[nextIndex];
      if (nextPlayer && hasAvailableCategories(nextPlayer.id)) {
        console.log(
          `Found next available player at index ${nextIndex}: ${nextPlayer.name}`
        );
        return nextIndex;
      }
      nextIndex = (nextIndex + 1) % players.length;
      attempts++;
    }

    // If no player has available categories, return the first valid index
    // This should trigger the game over condition
    console.log(
      `No players with available categories found, returning index 0`
    );
    return 0;
  };

  // Function to calculate score for a category based on current dice
  const calculatePotentialScore = (category: KniffelCategory): number => {
    if (!gameState) return 0;
    const dice = gameState.dice;
    const counts: { [key: number]: number } = {};
    let sum = 0;
    dice.forEach((d) => {
      counts[d] = (counts[d] || 0) + 1;
      sum += d;
    });
    const sortedDice = [...dice].sort();
    const values = Object.values(counts).sort((a, b) => b - a);

    switch (category) {
      case "ones":
        return (counts[1] || 0) * 1;
      case "twos":
        return (counts[2] || 0) * 2;
      case "threes":
        return (counts[3] || 0) * 3;
      case "fours":
        return (counts[4] || 0) * 4;
      case "fives":
        return (counts[5] || 0) * 5;
      case "sixes":
        return (counts[6] || 0) * 6;
      case "threeOfAKind":
        return values[0] >= 3 ? sum : 0;
      case "fourOfAKind":
        return values[0] >= 4 ? sum : 0;
      case "fullHouse":
        return values[0] === 3 && values[1] === 2 ? 25 : 0;
      case "kniffel":
        return values[0] === 5 ? 50 : 0;
      case "chance":
        return sum;
      case "smallStraight":
        const uniqueSorted = Array.from(new Set(sortedDice));
        const straights = [
          [1, 2, 3, 4],
          [2, 3, 4, 5],
          [3, 4, 5, 6],
        ];
        for (const straight of straights) {
          if (straight.every((val) => uniqueSorted.includes(val))) return 30;
        }
        return 0;
      case "largeStraight":
        if (
          [1, 2, 3, 4, 5].every((v) => sortedDice.includes(v)) ||
          [2, 3, 4, 5, 6].every((v) => sortedDice.includes(v))
        )
          return 40;
        return 0;
      default:
        return 0;
    }
  };

  // --- 3. Event Handlers (Update state via pushState) ---
  const rollDice = () => {
    if (!isMyTurn || isRolling || !gameState || gameState.rollCount >= 3) {
      return;
    }
    setIsRolling(true);
    const currentDice = gameState.dice;
    setAnimatedDiceFaces(currentDice);

    const animateNextFrame = (prevFaces: number[]) => {
      if (selectedDiceIndices.length === 0) {
        return prevFaces.map(() => randomDie());
      }
      return prevFaces.map((die, index) =>
        !selectedDiceIndices.includes(index) ? die : randomDie()
      );
    };

    const rollInterval = setInterval(() => {
      setAnimatedDiceFaces(animateNextFrame);
    }, 60);

    setTimeout(() => {
      clearInterval(rollInterval);
      const finalDice =
        selectedDiceIndices.length === 0
          ? currentDice.map(() => randomDie())
          : currentDice.map((die, index) =>
              !selectedDiceIndices.includes(index) ? die : randomDie()
            );

      const nextState: KniffelGameState = {
        ...gameState,
        dice: finalDice,
        selectedDice: selectedDiceIndices,
        rollCount: gameState.rollCount + 1,
      };

      pushState(nextState);
      setIsRolling(false);
    }, 800);
  };

  const handleScoreSelect = (
    category: KniffelCategory,
    valueToScore: number | null
  ) => {
    if (
      !isMyTurn ||
      !gameState ||
      valueToScore === null ||
      gameState.rollCount === 0
    )
      return;

    const currentPlayerScores = gameState.scores[playerId] ?? BLANK_SCORE_SHEET;
    if (currentPlayerScores[category] !== null) {
      console.warn("Score already set for this category");
      return;
    }

    const newScores = {
      ...gameState.scores,
      [playerId]: {
        ...currentPlayerScores,
        [category]: valueToScore,
      },
    };

    const nextPlayerIndex = getNextPlayerIndex(gameState.currentPlayerIndex);

    const nextState: KniffelGameState = {
      ...gameState,
      scores: newScores,
      dice: Array(5).fill(1),
      selectedDice: [],
      rollCount: 0,
      currentPlayerIndex: nextPlayerIndex,
    };

    pushState(nextState);
  };

  const handlePassTurn = (scoreCategory: KniffelCategory | null = null) => {
    if (!isMyTurn || !gameState) return;

    let scoreToRecord = 0;
    let categoryToScore = scoreCategory;

    if (!categoryToScore) {
      const availableCategories = [...UPPER_SCORES, ...LOWER_SCORES].filter(
        (cat) => (gameState.scores[playerId]?.[cat] ?? null) === null
      );
      if (availableCategories.length > 0) {
        categoryToScore = availableCategories[0];
      } else {
        console.warn("Cannot pass turn, no available categories to score 0.");
        return;
      }
    }

    const currentPlayerScores = gameState.scores[playerId] ?? BLANK_SCORE_SHEET;
    if (currentPlayerScores[categoryToScore] !== null) {
      console.warn(
        `Cannot pass by scoring 0 in ${categoryToScore}, score already set.`
      );
      const firstAvailable = [...UPPER_SCORES, ...LOWER_SCORES].find(
        (cat) => (gameState.scores[playerId]?.[cat] ?? null) === null
      );
      if (firstAvailable) {
        categoryToScore = firstAvailable;
      } else {
        return;
      }
    }

    const newScores = {
      ...gameState.scores,
      [playerId]: {
        ...currentPlayerScores,
        [categoryToScore]: scoreToRecord,
      },
    };

    const nextPlayerIndex = getNextPlayerIndex(gameState.currentPlayerIndex);
    const nextState = {
      ...gameState,
      scores: newScores,
      dice: Array(5).fill(1),
      selectedDice: [],
      rollCount: 0,
      currentPlayerIndex: nextPlayerIndex,
    };
    pushState(nextState);
  };

  const handleLeaveGame = () => {
    if (roomId && playerId) {
      leaveRoomSocket(roomId, playerId);
    }
    setRoomId(null);
    setPlayerId(null);
    navigate("/games/kniffel");
  };

  const handleKickPlayer = (playerId: string) => {
    if (!isAdmin) return;
    if (roomId && playerId) {
      leaveRoomSocket(roomId, playerId);
    }
  };

  const handleRestartGame = () => {
    // Reset the game state
    const initialState: KniffelGameState = {
      dice: Array(5).fill(1),
      selectedDice: [],
      rollCount: 0,
      currentPlayerIndex: 0,
      scores: Object.fromEntries(players.map((p) => [p.id, BLANK_SCORE_SHEET])),
      gameOver: false,
      winner: null,
      gameOverTimestamp: null,
    };
    pushState(initialState);
  };

  // --- 4. Effects ---
  useEffect(() => {
    const fetchRoomCode = async () => {
      if (!roomId) return;
      try {
        const response = await fetch(`/api?action=getRoomCode&roomId=${roomId}`);
        if (response.ok) {
          const data = await response.json();
          setRoomCode(data.code);
        }
      } catch (err) {
        console.error("Failed to fetch room code:", err);
      }
    };
    fetchRoomCode();
  }, [roomId]);

  useEffect(() => {
    if (gameState) {
      setSelectedDiceIndices(gameState.selectedDice || []);
      setIsRolling(false);
    }
  }, [gameState?.currentPlayerIndex, gameState?.dice, gameState?.selectedDice]);

  // Handle case where current player doesn't exist (kicked/left) or has no available categories
  useEffect(() => {
    if (!gameState || gameState.gameOver || !players.length) return;

    const currentPlayer = players[gameState.currentPlayerIndex];

    // Check if current player index is out of bounds
    if (gameState.currentPlayerIndex >= players.length) {
      const nextPlayerIndex = getNextPlayerIndex(gameState.currentPlayerIndex);
      pushState({
        ...gameState,
        currentPlayerIndex: nextPlayerIndex,
        dice: Array(5).fill(1),
        selectedDice: [],
        rollCount: 0,
      });
      return;
    }

    // Check if current player doesn't exist or has no available categories
    const shouldAdvanceTurn =
      !currentPlayer ||
      (currentPlayer && !hasAvailableCategories(currentPlayer.id));

    if (shouldAdvanceTurn) {
      // Current player doesn't exist or has no available categories, find next available player
      const nextPlayerIndex = getNextPlayerIndex(gameState.currentPlayerIndex);
      if (nextPlayerIndex !== gameState.currentPlayerIndex) {
        console.log(
          `Advancing turn from player ${gameState.currentPlayerIndex} to ${nextPlayerIndex} due to player unavailable`
        );
        pushState({
          ...gameState,
          currentPlayerIndex: nextPlayerIndex,
          dice: Array(5).fill(1),
          selectedDice: [],
          rollCount: 0,
        });
      }
    }
  }, [
    gameState,
    players,
    getNextPlayerIndex,
    pushState,
    hasAvailableCategories,
  ]);

  // useEffect to check if game is over and determine winner
  useEffect(() => {
    if (!gameState || gameState.gameOver || !players.length) return;

    // Check if all current players have filled all their categories
    const allScoresFilled = players.every((player) => {
      const playerScores = gameState.scores[player.id] ?? BLANK_SCORE_SHEET;
      return (
        UPPER_SCORES.every((cat) => playerScores[cat] !== null) &&
        LOWER_SCORES.every((cat) => playerScores[cat] !== null)
      );
    });

    // Alternative check: if no current player has any available categories
    const noPlayersHaveAvailableCategories = players.every(
      (player) => !hasAvailableCategories(player.id)
    );

    if (allScoresFilled || noPlayersHaveAvailableCategories) {
      // Calculate final scores for all players who have scores (including those who may have left)
      const allPlayerIds = Object.keys(gameState.scores);
      const playerFinalScores = allPlayerIds
        .map((playerId) => {
          const scores = gameState.scores[playerId] ?? BLANK_SCORE_SHEET;
          const upperSum = computeUpperSum(scores);
          const lowerSum = computeLowerSum(scores);
          const bonus = upperSum >= 63 ? 35 : 0;
          const totalScore = upperSum + lowerSum + bonus;

          // Find player name from current players, or use a fallback
          const currentPlayer = players.find((p) => p.id === playerId);
          const playerName =
            currentPlayer?.name || `Player ${playerId.slice(0, 8)}`;

          return {
            playerId: playerId,
            playerName: playerName,
            score: totalScore,
          };
        })
        .filter((player) => player.score > 0); // Only include players who have actually scored

      if (playerFinalScores.length > 0) {
        const winner = playerFinalScores.reduce(
          (prev, current) => (current.score > prev.score ? current : prev),
          playerFinalScores[0]
        );

        pushState({
          ...(gameState as KniffelGameState),
          gameOver: true,
          winner: winner,
          gameOverTimestamp: new Date().toISOString(),
        });
      }
    }
  }, [gameState, players, pushState, hasAvailableCategories]);

  useEffect(() => {
    if (players.length > 0) {
      setIsAdmin(players[0].id === playerId);
    }
  }, [players, playerId]);

  // --- 5. Render Logic ---
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">
        Loading game state...
      </div>
    );
  }

  const renderDice = () => {
    const diceToRender = isRolling ? animatedDiceFaces : gameState.dice;
    const safeDiceToRender =
      Array.isArray(diceToRender) && diceToRender.length === 5
        ? diceToRender
        : Array(5).fill(1);

    return safeDiceToRender.map((d, i) => (
      <motion.button
        key={i}
        onClick={() => {
          if (!isMyTurn || isRolling || gameState.rollCount === 0) return;
          setSelectedDiceIndices((prev) =>
            prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
          );
        }}
        disabled={!isMyTurn || isRolling || gameState.rollCount === 0}
        className={`bg-white/10 rounded-lg shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 
                   ${selectedDiceIndices.includes(i) ? "border-4 border-blue-500 scale-105" : "border-2 border-transparent"} 
                   ${!isMyTurn || isRolling || gameState.rollCount === 0 ? "opacity-60 cursor-not-allowed" : "hover:scale-105"}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <img
          src={DICE_IMAGES[d - 1]}
          alt={`Dice showing ${d}`}
          className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
        />
      </motion.button>
    ));
  };

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-gray-200 py-4 sm:py-8 md:py-12 px-2 sm:px-4">
      {/* Game over modal */}
      <div
        className={`fixed z-50 inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-500 ${
          gameState.gameOver
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 border border-gray-700">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-6 shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-center text-white mt-4 mb-6">
            Game Over!
          </h2>

          {gameState.winner && (
            <div className="space-y-6 mb-8">
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">
                  Winner
                </p>
                <p className="text-2xl font-bold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  {gameState.winner.playerName}
                </p>
              </div>

              <div className="bg-gray-700/30 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-400 mb-1">Final Score</p>
                <p className="text-3xl font-bold text-white">
                  {gameState.winner.score}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={handleRestartGame}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Restart
                </button>
                <button
                  onClick={handleLeaveGame}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Leave
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main game content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-y-2 mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Kniffel
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            {roomCode && (
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-600/50">
                <span className="text-gray-400 text-xs sm:text-sm">Code:</span>
                <span className="ml-1.5 sm:ml-2 text-white font-mono font-bold text-sm sm:text-base tracking-wider">
                  {roomCode}
                </span>
              </div>
            )}
            <button
              onClick={handleLeaveGame}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-lg shadow transition-colors duration-200 flex-shrink-0"
              title="Leave Game"
            >
              Leave
            </button>
          </div>
        </div>
        <div className="mb-6 flex justify-center gap-3 sm:gap-4 flex-wrap px-2">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`relative group flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl shadow-lg transition-all duration-300 border-2 min-w-[100px] sm:min-w-[120px] ${
                currentPlayerId === player.id
                  ? "bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400 text-white scale-105 ring-2 ring-blue-300/70"
                  : "bg-slate-700/80 border-slate-600/80 text-gray-300 hover:bg-slate-600/90 hover:border-slate-500/90"
              }`}
            >
              <div
                className="font-semibold text-sm sm:text-base truncate max-w-full px-1"
                title={player.name}
              >
                {player.name}
              </div>
              <div
                className={`text-xs sm:text-sm mt-1 opacity-80 ${currentPlayerId === player.id ? "font-medium" : ""}`}
              >
                {currentPlayerId === player.id
                  ? "Your Turn"
                  : `Player ${index + 1}`}
              </div>
              {/* Kick button: shown to admin for other players, not for themselves */}
              {isAdmin && player.id !== playerId && (
                <button
                  onClick={() => handleKickPlayer(player.id)}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 transform hover:scale-110 focus:scale-110"
                  title={`Kick ${player.name}`}
                  aria-label={`Kick ${player.name}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-700/50">
          <div className="flex flex-col items-center justify-start lg:w-auto lg:basis-1/4 lg:pr-8 flex-shrink-0">
            <div className="flex flex-row flex-wrap lg:flex-col gap-2 sm:gap-3 mb-4 sm:mb-6 w-full items-center max-w-[150px] sm:max-w-[200px] mx-auto">
              {renderDice()}
            </div>

            <div className="w-full flex flex-col items-center gap-3 max-w-xs">
              <button
                onClick={rollDice}
                disabled={!isMyTurn || isRolling || gameState.rollCount >= 3}
                className={`w-full px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 ${
                  !isMyTurn || isRolling || gameState.rollCount >= 3
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-70"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
              >
                {isRolling
                  ? "Rolling…"
                  : isMyTurn
                    ? `Roll Dice (${gameState.rollCount}/3)`
                    : `Waiting... (${gameState.rollCount}/3)`}
              </button>

              {isMyTurn && gameState.rollCount > 0 && (
                <button
                  onClick={() => handlePassTurn()}
                  className="w-full px-6 py-3 rounded-lg font-semibold text-base bg-red-700/80 hover:bg-red-700 text-white transition-colors duration-200 shadow hover:shadow-md"
                  title="Pass turn and score 0 in the first available category."
                >
                  Pass Turn (Score 0)
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 lg:basis-3/4 min-w-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="whitespace-nowrap text-gray-400 px-2 py-3 text-sm sticky left-0 bg-gray-800/50 z-10 min-w-[120px]">
                      Category
                    </TableHead>
                    {players.map((p) => (
                      <TableHead
                        key={p.id}
                        className="text-center font-medium text-base text-gray-300 px-4 w-[120px]"
                      >
                        <span className="block truncate">{p.name}</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Upper Section */}
                  <TableRow className="font-semibold bg-gray-700/50 border-gray-700">
                    <TableCell
                      colSpan={players.length + 1}
                      className="text-gray-200 py-2 sticky left-0 bg-gray-700/50 z-10"
                    >
                      Upper Section
                    </TableCell>
                  </TableRow>
                  {UPPER_SCORES.map((cat, rowIdx) => {
                    const categoryName = cat
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <TableRow
                        key={cat}
                        className={`border-gray-700/50 ${rowIdx % 2 === 0 ? "bg-gray-900/30" : "bg-gray-800/30"}`}
                      >
                        <TableCell className="whitespace-nowrap px-2 py-1.5 font-medium text-gray-300 sticky left-0 bg-inherit z-10 min-w-[120px]">
                          {categoryName}
                        </TableCell>
                        {players.map((p) => {
                          const playerScores =
                            gameState.scores[p.id] ?? BLANK_SCORE_SHEET;
                          const potentialScore = calculatePotentialScore(cat);
                          const scoreIsSet = playerScores[cat] !== null;
                          const canSelectScore =
                            isMyTurn &&
                            p.id === playerId &&
                            gameState.rollCount > 0 &&
                            !scoreIsSet;

                          return (
                            <TableCell
                              key={`${p.id}-${cat}`}
                              className={`text-center px-4 py-1.5 w-[120px] ${canSelectScore ? "cursor-pointer hover:bg-green-700/60 ring-1 ring-green-500" : ""}
                              ${
                                potentialScore === 0
                                  ? "bg-gray-700/50 border-gray-600/50 text-red-400"
                                  : ""
                              } transition-all duration-150`}
                              onClick={() =>
                                canSelectScore &&
                                handleScoreSelect(cat, potentialScore)
                              }
                              title={
                                canSelectScore
                                  ? `Click to score ${potentialScore} for ${categoryName}`
                                  : scoreIsSet
                                    ? "Score taken"
                                    : "Cannot score now"
                              }
                            >
                              <div
                                className={`w-full h-full min-h-[38px] flex items-center justify-center rounded border text-sm ${
                                  scoreIsSet
                                    ? "bg-gray-600/80 border-gray-500/70 text-gray-200 font-semibold"
                                    : canSelectScore
                                      ? potentialScore === 0
                                        ? "bg-red-900/80 border-red-700 text-white animate-pulse"
                                        : "bg-green-900/80 border-green-700 text-white animate-pulse"
                                      : "bg-gray-700/50 border-gray-600/50 text-gray-400"
                                }`}
                              >
                                {scoreIsSet
                                  ? playerScores[cat]
                                  : canSelectScore
                                    ? potentialScore
                                    : "-"}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  {/* Bonus row */}
                  <TableRow className="bg-gray-800/60 border-gray-700/50">
                    <TableCell className="font-medium text-gray-300 py-1.5 sticky left-0 bg-inherit z-10">
                      Bonus (if ≥ 63)
                    </TableCell>
                    {players.map((p) => {
                      const playerScores =
                        gameState.scores[p.id] ?? BLANK_SCORE_SHEET;
                      const upperSum = computeUpperSum(playerScores);
                      const bonus = upperSum >= 63 ? 35 : 0;
                      return (
                        <TableCell
                          key={p.id}
                          className="text-right text-gray-200 pr-3 py-1.5 font-medium"
                        >
                          {bonus}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {/* Upper Total */}
                  <TableRow className="bg-gray-800/60 font-semibold border-gray-700/50">
                    <TableCell className="text-gray-100 py-1.5 sticky left-0 bg-inherit z-10">
                      Upper Total
                    </TableCell>
                    {players.map((p) => {
                      const playerScores =
                        gameState.scores[p.id] ?? BLANK_SCORE_SHEET;
                      const upperSum = computeUpperSum(playerScores);
                      const bonus = upperSum >= 63 ? 35 : 0;
                      return (
                        <TableCell
                          key={p.id}
                          className="text-right text-gray-100 pr-3 py-1.5"
                        >
                          {upperSum + bonus}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {/* Lower Section */}
                  <TableRow className="font-semibold bg-gray-700/50 mt-2 border-t-2 border-gray-600">
                    <TableCell
                      colSpan={players.length + 1}
                      className="text-gray-200 py-2 pt-3 sticky left-0 bg-gray-700/50 z-10"
                    >
                      Lower Section
                    </TableCell>
                  </TableRow>
                  {LOWER_SCORES.map((cat, rowIdx) => {
                    const categoryName = cat
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <TableRow
                        key={cat}
                        className={`border-gray-700/50 ${rowIdx % 2 === 0 ? "bg-gray-900/30" : "bg-gray-800/30"}`}
                      >
                        <TableCell className="whitespace-nowrap px-2 py-1.5 font-medium text-gray-300 sticky left-0 bg-inherit z-10 min-w-[120px]">
                          {categoryName}
                        </TableCell>
                        {players.map((p) => {
                          const playerScores =
                            gameState.scores[p.id] ?? BLANK_SCORE_SHEET;
                          const potentialScore = calculatePotentialScore(cat);
                          const scoreIsSet = playerScores[cat] !== null;
                          const canSelectScore =
                            isMyTurn &&
                            p.id === playerId &&
                            gameState.rollCount > 0 &&
                            !scoreIsSet;

                          return (
                            <TableCell
                              key={`${p.id}-${cat}`}
                              className={`text-center px-4 py-1.5 w-[120px] ${canSelectScore ? "cursor-pointer hover:bg-green-700/60 ring-1 ring-green-500" : ""} transition-all duration-150`}
                              onClick={() =>
                                canSelectScore &&
                                handleScoreSelect(cat, potentialScore)
                              }
                              title={
                                canSelectScore
                                  ? `Click to score ${potentialScore} for ${categoryName}`
                                  : scoreIsSet
                                    ? "Score taken"
                                    : "Cannot score now"
                              }
                            >
                              <div
                                className={`w-full h-full min-h-[38px] flex items-center justify-center rounded border text-sm ${
                                  scoreIsSet
                                    ? "bg-gray-600/80 border-gray-500/70 text-gray-200 font-semibold"
                                    : canSelectScore
                                      ? potentialScore === 0
                                        ? "bg-red-900/80 border-red-700 text-white animate-pulse"
                                        : "bg-green-900/80 border-green-700 text-white animate-pulse"
                                      : "bg-gray-700/50 border-gray-600/50 text-gray-400"
                                }`}
                              >
                                {scoreIsSet
                                  ? playerScores[cat]
                                  : canSelectScore
                                    ? potentialScore
                                    : "-"}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  {/* Lower Total */}
                  <TableRow className="bg-gray-800/60 border-gray-700/50">
                    <TableCell className="font-medium text-gray-300 py-1.5 sticky left-0 bg-inherit z-10">
                      Lower Total
                    </TableCell>
                    {players.map((p) => {
                      const playerScores =
                        gameState.scores[p.id] ?? BLANK_SCORE_SHEET;
                      const lowerSum = computeLowerSum(playerScores);
                      return (
                        <TableCell
                          key={p.id}
                          className="text-right text-gray-200 pr-3 py-1.5 font-medium"
                        >
                          {lowerSum}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {/* Grand Total */}
                  <TableRow className="font-semibold bg-gray-700/60 border-t-2 border-gray-600">
                    <TableCell className="text-gray-100 py-1.5 sticky left-0 bg-gray-700/60 z-10">
                      Grand Total
                    </TableCell>
                    {players.map((p) => {
                      const playerScores =
                        gameState.scores[p.id] ?? BLANK_SCORE_SHEET;
                      const upperSum = computeUpperSum(playerScores);
                      const lowerSum = computeLowerSum(playerScores);
                      const bonus = upperSum >= 63 ? 35 : 0;
                      return (
                        <TableCell
                          key={p.id}
                          className="text-right text-lg text-white pr-3 py-1.5 font-bold"
                        >
                          {upperSum + lowerSum + bonus}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
