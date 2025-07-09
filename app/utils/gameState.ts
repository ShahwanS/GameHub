// Kniffel-specific game‑state shape

// All score categories in a Kniffel sheet
export type KniffelCategory =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "threeOfAKind"
  | "fourOfAKind"
  | "fullHouse"
  | "smallStraight"
  | "largeStraight"
  | "kniffel"
  | "chance";

// A single player’s score sheet
export type KniffelScores = Record<KniffelCategory, number | null>;

// Winner information type
export interface KniffelWinner {
  playerId: string;
  playerName: string;
  score: number;
}

// The live game state JSON we'll persist & broadcast
export interface KniffelGameState {
  dice: number[]; // length = 5, values 1–6
  selectedDice: number[]; // indexes (0–4) of held dice
  rollCount: number; // how many rolls used this turn (0–3)
  currentPlayerIndex: number; // whose turn it is (0-based)
  scores: Record<string, KniffelScores>;
  gameOver: boolean; // true if the game is over
  winner: KniffelWinner | null; // winner information, or null if game not over
  gameOverTimestamp: string | null; // ISO timestamp of when the game ended
}
