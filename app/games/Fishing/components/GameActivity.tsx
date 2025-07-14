import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../Card";
import { getSuitFullName, getSuitSymbol } from "~/utils/cardUtils";
import type { CardType, FishingGameState } from "../types";

interface Player {
  id: string;
  name: string;
  isCurrentPlayer?: boolean;
  joinedAt?: string;
}

interface GameActivityProps {
  currentAsk: {
    targetPlayerId: string;
    targetPlayerName: string;
    requestedRank: string;
    shownCards: CardType[];
  } | null;
  showGuessPopup: boolean;
  playerId: string;
  allPlayers: Player[];
  gameState: FishingGameState | null;
  showLastMove: boolean;
  currentPlayerName: string;
  isMyTurn: boolean;
}



export default function GameActivity({
  currentAsk,
  showGuessPopup,
  playerId,
  allPlayers,
  gameState,
  showLastMove,
  currentPlayerName,
  isMyTurn,
}: GameActivityProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white/90 mb-4">Game Activity:</h3>
      {/* Current Ask Display - Only show to the asking player */}
      {currentAsk && showGuessPopup && playerId !== currentAsk.targetPlayerId && (
        <motion.div
          className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-400/30 mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h4 className="text-lg font-semibold text-blue-300 mb-3">🎯 Current Ask:</h4>
          <p className="text-blue-200 mb-2">
            <span className="font-semibold">{allPlayers.find(p => p.id === playerId)?.name}</span>
            {" asked "}
            <span className="font-semibold">{currentAsk.targetPlayerName}</span>
            {" for "}
            <span className="font-bold text-yellow-300">{currentAsk.requestedRank}s</span>
          </p>
          <p className="text-blue-200 mb-3">
            {currentAsk.targetPlayerName} has {currentAsk.shownCards.length} {currentAsk.requestedRank}(s)
          </p>
          {/* <div className="flex gap-2 flex-wrap">
            {currentAsk.shownCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card rank={card.rank as any} suit={card.suit as any} />
              </motion.div>
            ))}
          </div> */}
          <p className="text-blue-200 mt-3 text-sm">
            Select the suits you think these cards are...
          </p>
        </motion.div>
      )}
      {/* Current Ask Display - For other players (no card details) */}
      {currentAsk && showGuessPopup && playerId === currentAsk.targetPlayerId && (
        <motion.div
          className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-400/30 mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h4 className="text-lg font-semibold text-blue-300 mb-3">🎯 Current Ask:</h4>
          <p className="text-blue-200 mb-2">
            <span className="font-semibold">{allPlayers.find(p => p.id === playerId)?.name}</span>
            {" asked "}
            <span className="font-semibold">{currentAsk.targetPlayerName}</span>
            {" for "}
            <span className="font-bold text-yellow-300">{currentAsk.requestedRank}s</span>
          </p>
          <p className="text-blue-200 mb-3">
            {currentAsk.targetPlayerName} has {currentAsk.shownCards.length} {currentAsk.requestedRank}(s)
          </p>
          <p className="text-blue-200 text-sm">
            Waiting for {allPlayers.find(p => p.id === playerId)?.name} to guess the suits...
          </p>
        </motion.div>
      )}
      {/* Recent Activity - Temporary display */}
      {gameState?.lastMove && showLastMove && (
        <motion.div
          className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-lg font-semibold text-green-300 mb-2">📝 Last Move:</h4>
          <div className="text-green-200 space-y-1">
            <p>
              <span className="font-semibold">{gameState.lastMove.playerName}</span>
              {" asked "}
              <span className="font-semibold">{allPlayers.find(p => p.id === gameState.lastMove?.targetPlayerId)?.name}</span>
              {" for "}
              <span className="font-bold text-yellow-300">{gameState.lastMove.requestedRank}s</span>
            </p>
            {gameState.lastMove.guessedSuits && gameState.lastMove.guessedSuits.length > 0 && (
              <p className="text-sm">
                Guessed suits: {gameState.lastMove.guessedSuits.map(suit => `${getSuitFullName(suit)} ${getSuitSymbol(suit)}`).join(", ")}
                {gameState.lastMove.guessCorrect !== null && (
                  <span className={gameState.lastMove.guessCorrect ? " text-green-300" : " text-red-300"}>
                    {" - "}{gameState.lastMove.guessCorrect ? "Correct!" : "Wrong"}
                  </span>
                )}
              </p>
            )}
            {gameState.lastMove.cardsExchanged.length > 0 && (
              <p className="text-sm">
                Cards exchanged: {gameState.lastMove.cardsExchanged.length}
              </p>
            )}
          </div>
        </motion.div>
      )}
      {/* Turn Status */}
      <motion.div
        className="bg-slate-500/20 backdrop-blur-sm rounded-xl p-4 border border-slate-400/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h4 className="text-lg font-semibold text-slate-300 mb-2">🔄 Turn Status:</h4>
        <p className="text-slate-200">
          {isMyTurn ? (
            <span className="text-blue-300 font-semibold">It's your turn! Click on a player to ask for cards.</span>
          ) : (
            <span>
              Waiting for <span className="font-semibold text-yellow-300">{currentPlayerName}</span> to make their move...
            </span>
          )}
        </p>
      </motion.div>
    </div>
  );
} 