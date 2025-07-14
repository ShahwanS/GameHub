import { useFishingGame } from "./hooks/useFishingGame";
import Card from "./Card";
import { useEffect } from "react";
import type { FishingGameState } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import Stockpile from "./components/Stockpile";
import PlayerBar from "./components/PlayerBar";
import GameActivity from "./components/GameActivity";
import Hand from "./components/Hand";
import GuessSuitsDialog from "./components/GuessSuitsDialog";


export default function FishingGame() {
  const {
    playerId,
    allPlayers,
    isHost,
    gameStarted,
    roomCode,
    selectedRank,
    setSelectedRank,
    selectedPlayer,
    setSelectedPlayer,
    showGuessPopup,
    setShowGuessPopup,
    guessedSuits,
    setGuessedSuits,
    showCardSelection,
    setShowCardSelection,
    currentAsk,
    setCurrentAsk,
    showLastMove,
    setShowLastMove,
    handleStartGame,
    handleNewGame,
    handlePlayerClick,
    handleCardSelect,
    handleAskForCards,
    handleGuessSuits,
    handleSuitToggle,
    handleGuessDialogClose,
    gameState,
    myHand,
    currentPlayerId,
    currentPlayerName,
    isMyTurn,
    availableRanks,
    playerStockpiles,
    displayHand,
  } = useFishingGame();



  // Show last move temporarily when it changes
  useEffect(() => {
    if (gameState && (gameState as FishingGameState).lastMove) {
      setShowLastMove(true);
      const timer = setTimeout(() => {
        setShowLastMove(false);
      }, 5000); // Show for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // LOBBY SCREEN
  if (!gameStarted) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
        <PlayerBar
          allPlayers={allPlayers}
          currentPlayerId={currentPlayerId}
          playerId={playerId!}
          roomCode={roomCode}
          isHost={isHost}
          gameStarted={gameStarted}
          handleStartGame={handleStartGame}
          handleNewGame={handleNewGame}
          handlePlayerClick={handlePlayerClick}
        />
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-10 w-full max-w-lg flex flex-col items-center border border-white/20"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-white drop-shadow-lg">Waiting for players…</h1>
            <p className="text-white/80 text-lg">The host will start the game when everyone is ready.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
      <PlayerBar
        allPlayers={allPlayers}
        currentPlayerId={currentPlayerId}
        playerId={playerId!}
        roomCode={roomCode}
        isHost={isHost}
        gameStarted={gameStarted}
        handleStartGame={handleStartGame}
        handleNewGame={handleNewGame}
        handlePlayerClick={handlePlayerClick}
      />
      
      <div className="flex-1 p-2 sm:p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Game Status */}
          <div className="mb-4 sm:mb-6 text-center">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">Current Player: {currentPlayerName}</h2>
            {isMyTurn && (
              <p className="text-blue-300 font-semibold text-sm sm:text-base md:text-lg">It's your turn! Click on a player to ask for cards.</p>
            )}
          </div>

          {/* Deck Display */}
          <div className="mb-4 sm:mb-6 md:mb-8 text-center">
            <h3 className="text-base sm:text-lg font-semibold text-white/90 mb-2 sm:mb-4">Deck</h3>
            <motion.div 
              className="flex justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <div className="w-12 h-18 sm:w-14 sm:h-21 md:w-16 md:h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-lg border-2 border-white shadow-xl flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🎴</span>
                </div>
                <div className="absolute -top-1 -right-1 w-12 h-18 sm:w-14 sm:h-21 md:w-16 md:h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-white shadow-lg flex items-center justify-center transform rotate-6">
                  <span className="text-white text-xs font-bold">🎴</span>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-18 sm:w-14 sm:h-21 md:w-16 md:h-24 bg-gradient-to-br from-green-600 to-green-800 rounded-lg border-2 border-white shadow-md flex items-center justify-center transform rotate-12">
                  <span className="text-white text-xs font-bold">🎴</span>
                </div>
              </div>
            </motion.div>
            <p className="text-white/70 text-xs sm:text-sm mt-1 sm:mt-2">{gameState?.deck?.length || 0} cards remaining</p>
          </div>

          {/* Other Players' Hands */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-white/90 mb-2 sm:mb-4">Other Players:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {allPlayers
                .filter(p => p.id !== playerId)
                .map((player) => {
                  const playerHand = gameState?.playerHands?.[player.id] || [];
                  return (
                    <motion.div
                      key={player.id}
                      className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 shadow-lg transition-all duration-200 space-y-2
                        ${isMyTurn ? 'hover:bg-white/20 cursor-pointer hover:scale-105' : ''}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      onClick={() => handlePlayerClick(player.id)}
                      whileHover={isMyTurn ? { scale: 1.05 } : {}}
                    >
                      <h4 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">{player.name}</h4>
                      <div className="flex gap-1 sm:gap-2 flex-wrap">
                        {displayHand(playerHand).map((_, idx) => (
                          <motion.div
                            key={idx}
                            className="w-8 h-10 sm:w-10 sm:h-13 md:w-12 md:h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg border-2 border-white shadow-md flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <span className="text-white text-xs font-bold">🎴</span>
                          </motion.div>
                        ))}
                      </div>
                      {/* Redesigned Stockpile for other player */}
                      <Stockpile
                        sets={playerStockpiles[player.id] || []}
                        points={(playerStockpiles[player.id] || []).length}
                        isSelf={false}
                      />
                      <p className="text-xs text-white/60 mt-1 sm:mt-2">{displayHand(playerHand).length} cards</p>
                    </motion.div>
                  );
                })}
            </div>
          </div>

          {/* Your Hand */}
          <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 items-start">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-white/90 mb-2 sm:mb-4">Your Hand:</h3>
              <Hand
                myHand={displayHand(myHand)}
              />
            </div>
            {/* Redesigned Stockpile for current player */}
            <div className="w-full lg:w-auto">
              <Stockpile
                sets={playerStockpiles[playerId!] || []}
                points={(playerStockpiles[playerId!] || []).length}
                isSelf={true}
              />
            </div>
          </div>

          {/* Game Activity Display */}
          <GameActivity
            currentAsk={currentAsk}
            showGuessPopup={showGuessPopup}
            playerId={playerId!}
            allPlayers={allPlayers}
            gameState={gameState}
            showLastMove={showLastMove}
            currentPlayerName={currentPlayerName}
            isMyTurn={isMyTurn}
          />
        </div>
      </div>

      {/* Card Selection Overlay */}
      <AnimatePresence>
        {showCardSelection && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-white/20 shadow-2xl max-w-4xl w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mb-4 sm:mb-6 drop-shadow-lg">
                Choose a card to ask {allPlayers.find(p => p.id === selectedPlayer)?.name} for:
              </h3>
              <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center">
                {availableRanks.map((rank, idx) => {
                  // Find a card with this rank from your hand to show the actual card
                  const cardToShow = myHand.find(card => card.rank === rank);
                  return (
                    <motion.div
                      key={rank}
                      initial={{ scale: 0, y: 50 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.1, y: -10 }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer"
                      onClick={() => handleCardSelect(rank)}
                    >
                      <Card rank={cardToShow?.rank as any} suit={cardToShow?.suit as any} />
                    </motion.div>
                  );
                })}
              </div>
              <div className="text-center mt-4 sm:mt-6">
                <Button
                  onClick={() => setShowCardSelection(false)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guess Suits Popup */}
      <GuessSuitsDialog
        open={showGuessPopup}
        onOpenChange={handleGuessDialogClose}
        currentAsk={currentAsk}
        guessedSuits={guessedSuits}
        handleSuitToggle={handleSuitToggle}
        handleGuessSuits={handleGuessSuits}
      />

      {/* Game End Overlay */}
      {gameState?.gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-lg w-full flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-slate-800">Game Over!</h2>
            <div className="mb-3 sm:mb-4 text-base sm:text-lg text-slate-700 text-center">
              {(() => {
                const scores = Object.fromEntries(allPlayers.map(p => [p.name, gameState.playerScores[p.id] || 0]));
                const max = Math.max(...Object.values(scores) as number[]);
                const winners = Object.entries(scores).filter(([_, v]) => v === max).map(([name]) => name);
                if (winners.length === 1) {
                  return <span>Winner: <span className="font-bold text-green-600">{winners[0]}</span> with {max} points!</span>;
                } else {
                  return <span>It's a tie between <span className="font-bold text-green-600">{winners.join(", ")}</span> with {max} points!</span>;
                }
              })()}
            </div>
            <Button onClick={handleNewGame} className="bg-blue-500 text-white font-bold mt-2">New Game</Button>
          </div>
        </div>
      )}
    </div>
  );
}