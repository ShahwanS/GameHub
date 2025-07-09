import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NimGameState, NimMove } from './types';
import { useRoom } from '~/components/GameLayout';
import type { PlayerDTO } from '~/utils/types';
import { leaveRoom as leaveRoomSocket } from '~/utils/socketClient';
import { useNavigate } from '@remix-run/react';
import { useRoomPersistence } from '~/context/RoomPersistenceContext';
import { 
  getActualRemainingCoins, 
  calculateNimSum, 
  isCoinRemoved, 
  removeCoin, 
  endTurn, 
  createInitialState,
  selectFirstPlayer
} from './gameLogic';

const ROWS = [1, 3, 5, 7];
const COIN_IMG = '/coin.png';

const NimGame: React.FC = () => {
  const { roomId, playerId, players, latestState, pushState } = useRoom();
  const [lockedRow, setLockedRow] = useState<number | null>(null);
  const [hasRemoved, setHasRemoved] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setRoomId, setPlayerId } = useRoomPersistence();

  const gameState: NimGameState = latestState || createInitialState(ROWS);

  useEffect(() => {
    async function fetchRoomCode() {
      if (!roomId) return;
      try {
        const response = await fetch(`/api?action=getRoomCode&roomId=${roomId}`);
        if (response.ok) {
          const data = await response.json();
          setRoomCode(data.code);
        }
      } catch (err) {
        setRoomCode(null);
      }
    }
    fetchRoomCode();
  }, [roomId]);

  const currentPlayer = players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const canPlay = players.length >= 1;
  
  const actualRemainingCoins = getActualRemainingCoins(gameState);
  const nimSum = calculateNimSum(gameState);

  const handleCoinClick = (rowIdx: number, coinIdx: number) => {
    if (!isMyTurn || gameState.gameOver || !canPlay || !gameState.firstPlayerSelected) return;
    if (gameState.heaps[rowIdx] === 0) return;
    if (lockedRow !== null && lockedRow !== rowIdx) return;
    // Only allow removing from one row per turn
    if (hasRemoved && lockedRow !== rowIdx) return;
    
    try {
      const playerName = players.find((p: PlayerDTO) => p.id === playerId)?.name || 'Unknown';
      const newState = removeCoin(gameState, playerId, playerName, rowIdx, coinIdx);
      
      if (newState.gameOver) {
        const loser = playerId;
        let winner: string | null = null;
        if (players.length === 2) {
          winner = players.find((p) => p.id !== playerId)?.id || null;
        }
        newState.winner = winner;
      }
      
      pushState(newState);
      setLockedRow(rowIdx);
      setHasRemoved(true);
    } catch (error) {
      console.log('Invalid move:', error);
    }
  };

  const handleEndTurn = () => {
    if (!isMyTurn || !hasRemoved || gameState.gameOver) return;
    const newState = endTurn(gameState, players.length);
    pushState(newState);
    setLockedRow(null);
    setHasRemoved(false);
  };

  const handleNewGame = () => {
    const initialState = createInitialState(ROWS);
    pushState(initialState);
    setLockedRow(null);
    setHasRemoved(false);
  };

  const handleSelectFirstPlayer = (selectedPlayerId: string) => {
    if (gameState.firstPlayerSelected) return;
    
    try {
      const newState = selectFirstPlayer(gameState, selectedPlayerId, players);
      pushState(newState);
    } catch (error) {
      console.log('Error selecting first player:', error);
    }
  };

  const handleLeaveGame = () => {
    if (roomId && playerId) {
      leaveRoomSocket(roomId, playerId);
    }
    setRoomId(null);
    setPlayerId(null);
    navigate('/');
  };

  const renderTriangle = () => (
    <div className="flex flex-col items-center gap-2 mb-8 mt-4">
      {gameState.heaps.map((coins, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-2 w-full">
          <div className="flex-1" />
          <AnimatePresence initial={false}>
            {Array.from({ length: coins }).map((_, coinIdx) => {
              const isRemoved = isCoinRemoved(gameState, rowIdx, coinIdx);
              
              if (isRemoved) return null;
              
              return (
                <motion.div
                  key={`${rowIdx}-${coinIdx}`}
                  className="w-18 h-18 flex items-center justify-center"
                  style={{ aspectRatio: '1/1' }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.35, type: 'spring' }}
                >
                  <img
                    src={COIN_IMG}
                    alt="coin"
                    onClick={() => handleCoinClick(rowIdx, coinIdx)}
                    className={`w-16 h-16 object-cover rounded-full shadow-md border-2 cursor-pointer transition-all duration-200 select-none bg-amber-200
                      ${isMyTurn && (lockedRow === null || lockedRow === rowIdx) && !gameState.gameOver ? 'hover:ring-2 hover:ring-blue-400' : 'opacity-60 cursor-not-allowed'}`}
                    draggable={false}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div className="flex-1" />
        </div>
      ))}
    </div>
  );

  // --- UI ---
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Room code display */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🎮 Nim Game
        </h1>
        {roomCode && (
          <div className="bg-gray-700/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-600/50">
            <span className="text-gray-400 text-xs">Code:</span>
            <span className="ml-2 text-white font-mono font-bold text-base tracking-wider">{roomCode}</span>
          </div>
        )}
      </div>
      <div className="mb-8 flex justify-between items-center gap-2">
        <p className="text-gray-600 text-lg">
          Take turns removing coins from a single row. The player who removes the last coin loses!
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleNewGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg text-base"
          >
            New Game
          </button>
          <button
            onClick={handleLeaveGame}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg text-base"
          >
            Leave Game
          </button>
        </div>
      </div>
      {/* Game Status */}
      <div className="mb-6">{renderGameStatus()}</div>
      {/* First Player Selection */}
      {!gameState.firstPlayerSelected && players.length >= 2 && (
        <div className="mb-6">{renderFirstPlayerSelection()}</div>
      )}
      {/* Triangle Coins */}
      {gameState.firstPlayerSelected && renderTriangle()}
      {/* End Turn Button */}
      {isMyTurn && hasRemoved && !gameState.gameOver && (
        <div className="flex justify-center mb-8">
          <button
            onClick={handleEndTurn}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg text-lg"
          >
            End Turn
          </button>
        </div>
      )}
      {/* Game Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-2xl shadow-lg border border-blue-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Players</h3>
          <div className="space-y-3">
            {players.map((player: PlayerDTO, index: number) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  index === gameState.currentPlayerIndex 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-white/50 text-gray-700'
                }`}
              >
                <span className="font-semibold">{player.name}</span>
                <div className="flex items-center gap-2">
                  {index === gameState.currentPlayerIndex && <span className="text-2xl">🎯</span>}
                  {gameState.firstPlayerId === player.id && <span className="text-sm bg-yellow-500 text-white px-2 py-1 rounded-full">1st</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-100 p-6 rounded-2xl shadow-lg border border-purple-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Game Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="font-semibold text-gray-700">Nim-sum:</span>
              <span className="font-bold text-purple-600">{nimSum}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="font-semibold text-gray-700">Total coins:</span>
              <span className="font-bold text-purple-600">{actualRemainingCoins.reduce((sum, heap) => sum + heap, 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- First Player Selection ---
  function renderFirstPlayerSelection() {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-4">🎯 Choose Who Goes First</h2>
        <p className="text-xl mb-6">In Nim, the first player has a significant advantage (or disadvantage?). Choose wisely!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
          {players.map((player: PlayerDTO) => (
            <button
              key={player.id}
              onClick={() => handleSelectFirstPlayer(player.id)}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg text-lg border-2 border-white/30 hover:border-white/50"
            >
              {player.name}
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  // --- Game Status ---
  function renderGameStatus() {
    if (gameState.gameOver) {
      const winner = players.find((p: PlayerDTO) => p.id === gameState.winner) || null;
      const loser = gameState.lastMove?.playerId;
      const loserName = players.find((p: PlayerDTO) => p.id === loser)?.name || undefined;
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl shadow-xl"
        >
          <h2 className="text-3xl font-bold mb-3">🎉 Game Over!</h2>
          {winner ? (
            <p className="text-xl">{winner.name} wins! {loserName ? `${loserName} took the last coin and lost.` : ''}</p>
          ) : (
            <p className="text-xl">{loserName ? `${loserName} took the last coin and lost!` : 'Game completed'}</p>
          )}
        </motion.div>
      );
    }
    
    if (!gameState.firstPlayerSelected) {
      return (
        <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-100 rounded-2xl shadow-lg border border-yellow-200">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            ⏳ Waiting for First Player Selection
          </h2>
          <p className="text-gray-700">
            Players need to choose who goes first before the game can begin.
          </p>
        </div>
      );
    }
    
    return (
      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl shadow-lg border border-blue-200">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">
          {isMyTurn ? "🎯 Your Turn" : `⏳ ${currentPlayer?.name || 'Player'}'s Turn`}
        </h2>
        <p className="text-gray-700">
          {isMyTurn ? "Click a coin to remove it and all to its right in the row. Then end your turn." : "Waiting for opponent..."}
        </p>
      </div>
    );
  }
};

export default NimGame; 