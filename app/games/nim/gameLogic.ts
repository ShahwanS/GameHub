import type { NimGameState, NimMove } from './types';

export function isValidMove(state: NimGameState, heapIndex: number, objectsToRemove: number): boolean {
  if (state.gameOver) return false;
  if (heapIndex < 0 || heapIndex >= state.heaps.length) return false;
  if (objectsToRemove <= 0) return false;
  if (objectsToRemove > state.heaps[heapIndex]) return false;
  return true;
}

export function getActualRemainingCoins(state: NimGameState): number[] {
  return state.heaps.map((heap, rowIndex) => {
    const removedInRow = (state.removedCoins || []).filter(key => key.startsWith(`${rowIndex}-`)).length;
    return heap - removedInRow;
  });
}

export function calculateNimSum(state: NimGameState): number {
  const actualRemainingCoins = getActualRemainingCoins(state);
  return actualRemainingCoins.reduce((acc, h) => acc ^ h, 0);
}

// Check if a specific coin has been removed
export function isCoinRemoved(state: NimGameState, rowIdx: number, coinIdx: number): boolean {
  const coinKey = `${rowIdx}-${coinIdx}`;
  return (state.removedCoins || []).includes(coinKey);
}

// Remove a specific coin and return new state
export function removeCoin(
  state: NimGameState,
  playerId: string,
  playerName: string,
  rowIdx: number,
  coinIdx: number
): NimGameState {
  const coinKey = `${rowIdx}-${coinIdx}`;
  if (isCoinRemoved(state, rowIdx, coinIdx)) {
    throw new Error('Coin already removed');
  }

  const newRemovedCoins = [...(state.removedCoins || []), coinKey];
  
  // Calculate actual remaining coins for game over check
  const actualRemainingCoins = state.heaps.map((heap, rowIndex) => {
    const removedInRow = newRemovedCoins.filter(key => key.startsWith(`${rowIndex}-`)).length;
    return heap - removedInRow;
  });
  
  const isGameOver = actualRemainingCoins.every(h => h === 0);

  const move: NimMove = {
    playerId,
    playerName,
    heapIndex: rowIdx,
    objectsRemoved: 1,
    timestamp: new Date().toISOString(),
  };

  return {
    ...state,
    currentPlayerIndex: state.currentPlayerIndex, // Don't advance turn yet
    gameOver: isGameOver,
    winner: isGameOver ? null : null, // Winner logic handled in component
    gameOverTimestamp: isGameOver ? new Date().toISOString() : null,
    lastMove: move,
    removedCoins: newRemovedCoins,
  };
}

export function endTurn(state: NimGameState, playersLength: number): NimGameState {
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % playersLength;
  return {
    ...state,
    currentPlayerIndex: nextPlayerIndex,
  };
}

export function createInitialState(heapSizes: number[] = [1, 3, 5, 7]): NimGameState {
  return {
    heaps: [...heapSizes],
    currentPlayerIndex: 0,
    gameOver: false,
    winner: null,
    gameOverTimestamp: null,
    lastMove: null,
    removedCoins: [],
    firstPlayerSelected: false,
    firstPlayerId: null,
  };
}

export function isGameOver(state: NimGameState): boolean {
  const actualRemainingCoins = getActualRemainingCoins(state);
  return actualRemainingCoins.every(heap => heap === 0);
}

export function getAvailableMoves(state: NimGameState): Array<{ heapIndex: number; maxObjects: number }> {
  if (state.gameOver) return [];
  
  const actualRemainingCoins = getActualRemainingCoins(state);
  return actualRemainingCoins
    .map((heapSize, index) => ({ heapIndex: index, maxObjects: heapSize }))
    .filter(move => move.maxObjects > 0);
}

export function selectFirstPlayer(state: NimGameState, firstPlayerId: string, players: Array<{ id: string; name: string }>): NimGameState {
  const firstPlayerIndex = players.findIndex(p => p.id === firstPlayerId);
  if (firstPlayerIndex === -1) {
    throw new Error('Invalid player ID');
  }
  
  return {
    ...state,
    firstPlayerSelected: true,
    firstPlayerId: firstPlayerId,
    currentPlayerIndex: firstPlayerIndex,
  };
} 