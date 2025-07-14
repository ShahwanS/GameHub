export interface FishingGameState {
  players: Player[];
  currentPlayerIndex: number;
  gameOver: boolean;
  winner: string | null;
  lastMove: FishingMove | null;
  playerHands: Record<string, CardType[]>;
  playerScores: Record<string, number>;
  playerStockpiles: Record<string, CardType[][]>; 
  deck: CardType[];
  discardedCards: CardType[];

  // Current game phase
  phase: 'asking' | 'showing' | 'guessing' | 'complete';
  
  // Current ask details
  currentAsk: {
    askingPlayerId: string;
    targetPlayerId: string;
    requestedRank: string;
    shownCards: CardType[]; // cards that were shown
  } | null;
} 

export interface Player {
  id: string;
  name: string;
  isCurrentPlayer: boolean;
}

export interface FishingMove {
  playerId: string;
  playerName: string;
  targetPlayerId: string;
  timestamp: string;
  
  // The ask
  requestedRank: string;
  targetPlayerCards: CardType[]; 
  
  // The guess
  guessedSuits: string[] | null;
  guessCorrect: boolean | null;
  
  // Result
  cardsExchanged: CardType[];
}

export interface CardType {
  suit: string;
  rank: string;
}