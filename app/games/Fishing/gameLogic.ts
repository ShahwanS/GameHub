import type { FishingGameState, CardType, Player } from './types';

export const SUITS = ['S', 'H', 'D', 'C'] as const;
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

// Create a deck
export function createDeck(): CardType[] {
  const deck: CardType[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

// Shuffle a deck
export function shuffleDeck(deck: CardType[]): CardType[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Deal cards to players
export function dealCards(deck: CardType[], players: Player[], cardsPerPlayer: number): { hands: Record<string, CardType[]>; rest: CardType[] } {
  let rest = [...deck];
  const hands: Record<string, CardType[]> = {};
  for (const player of players) {
    hands[player.id] = rest.splice(0, cardsPerPlayer);
  }
  return { hands, rest };
}

// Check for and handle completed sets (4 of a kind)
export function checkAndHandleCompletedSets(
  playerHands: Record<string, CardType[]>,
  playerScores: Record<string, number>,
  playerStockpiles: Record<string, CardType[][]>
): { playerHands: Record<string, CardType[]>; playerScores: Record<string, number>; playerStockpiles: Record<string, CardType[][]> } {
  const newPlayerHands = { ...playerHands };
  const newPlayerScores = { ...playerScores };
  const newPlayerStockpiles = { ...playerStockpiles };

  for (const playerId of Object.keys(newPlayerHands)) {
    const hand = newPlayerHands[playerId] || [];
    const rankGroups: Record<string, CardType[]> = {};
    
    // Group cards by rank
    hand.forEach(card => {
      if (!rankGroups[card.rank]) rankGroups[card.rank] = [];
      rankGroups[card.rank].push(card);
    });

    // Check for completed sets (4 of a kind)
    for (const rank in rankGroups) {
      if (rankGroups[rank].length === 4) {
        // Add to stockpile
        if (!newPlayerStockpiles[playerId]) newPlayerStockpiles[playerId] = [];
        newPlayerStockpiles[playerId].push(rankGroups[rank]);
        
        // Remove from hand
        newPlayerHands[playerId] = hand.filter(card => card.rank !== rank);
        
        // Add point
        newPlayerScores[playerId] = (newPlayerScores[playerId] || 0) + 1;
      }
    }
  }

  return { playerHands: newPlayerHands, playerScores: newPlayerScores, playerStockpiles: newPlayerStockpiles };
}

// Check if game is over
export function checkGameOver(state: FishingGameState): { gameOver: boolean; winner: string | null } {
  // Check if all hands are empty
  const allHands = Object.values(state.playerHands);
  const totalCards = allHands.reduce((sum, hand) => sum + hand.length, 0);
  const gameOver = totalCards === 0 || allHands.every(hand => hand.length === 0);
  
  if (gameOver) {
    // Find the winner(s)
    const entries = Object.entries(state.playerScores);
    if (entries.length === 0) return { gameOver: true, winner: null };
    
    const maxScore = Math.max(...entries.map(([_, score]) => score));
    const winners = entries.filter(([_, score]) => score === maxScore);
    
    const winner = winners.length === 1 ? winners[0][0] : null;
    return { gameOver: true, winner };
  }
  
  return { gameOver: false, winner: null };
}

// Pass turn to next player
export function passTurn(state: FishingGameState): FishingGameState {
  const newState = { ...state };
  newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
  newState.players = newState.players.map((p, i) => ({ ...p, isCurrentPlayer: i === newState.currentPlayerIndex }));
  return newState;
}

