export interface NimGameState {
  heaps: number[];
  currentPlayerIndex: number;
  gameOver: boolean;
  winner: string | null; 
  gameOverTimestamp: string | null;
  lastMove: NimMove | null;
  removedCoins: string[];
  firstPlayerSelected: boolean;
  firstPlayerId: string | null;
}

export interface NimMove {
  playerId: string;
  playerName: string;
  heapIndex: number;
  objectsRemoved: number;
  timestamp: string;
}

export interface NimPlayer {
  id: string;
  name: string;
  isCurrentPlayer: boolean;
} 