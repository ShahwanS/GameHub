import type { CardType } from '~/games/Fishing/types';

/**
 * Card suit symbols and styling data
 */
export const suitSymbols = {
  S: {
    symbol: "♠",
    color: "#374151"
  },
  H: {
    symbol: "♥",
    color: "#dc2626"
  },
  D: {
    symbol: "♦",
    color: "#dc2626"
  },
  C: {
    symbol: "♣",
    color: "#374151"
  }
};

/**
 * Card rank display mapping
 */
export const rankDisplay: Record<string, string> = {
  A: "A",
  J: "J",
  Q: "Q",
  K: "K",
  T: "10"
};

/**
 * Sorts a hand of cards by rank (A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2) 
 * and then by suit (Spades, Hearts, Diamonds, Clubs)
 */
export function sortHand(hand: CardType[]): CardType[] {
  const rankOrder = [
    "A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"
  ];
  const suitOrder = ["S", "H", "D", "C"];
  
  return [...hand].sort((a, b) => {
    const rankDiff = rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    if (rankDiff !== 0) return rankDiff;
    return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
  });
}

/**
 * Gets the display name for a card rank
 */
export function getRankDisplayName(rank: string): string {
  const rankNames: Record<string, string> = {
    'A': 'Ace',
    'K': 'King', 
    'Q': 'Queen',
    'J': 'Jack',
    '10': '10',
    '9': '9',
    '8': '8',
    '7': '7',
    '6': '6',
    '5': '5',
    '4': '4',
    '3': '3',
    '2': '2'
  };
  return rankNames[rank] || rank;
}

/**
 * Gets the display name for a card suit
 */
export function getSuitDisplayName(suit: string): string {
  const suitNames: Record<string, string> = {
    'S': 'Spades',
    'H': 'Hearts',
    'D': 'Diamonds',
    'C': 'Clubs'
  };
  return suitNames[suit] || suit;
}

/**
 * Gets the color for a card suit (for styling)
 */
export function getSuitColor(suit: string): string {
  const suitColors: Record<string, string> = {
    'S': 'text-gray-900',
    'H': 'text-red-600',
    'D': 'text-red-600',
    'C': 'text-gray-900'
  };
  return suitColors[suit] || 'text-gray-900';
}

/**
 * Gets the full name of a card suit
 */
export function getSuitFullName(suit: string): string {
  switch (suit) {
    case "S": return "Spades";
    case "H": return "Hearts";
    case "D": return "Diamonds";
    case "C": return "Clubs";
    default: return suit;
  }
}

/**
 * Gets the symbol for a card suit
 */
export function getSuitSymbol(suit: string): string {
  switch (suit) {
    case "S": return "♠";
    case "H": return "♥";
    case "D": return "♦";
    case "C": return "♣";
    default: return suit;
  }
} 