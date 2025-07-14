import type { FishingGameState, FishingMove, CardType, Player } from './types';
import type { PlayerDTO } from '~/utils/types';

export const SUITS = ['S', 'H', 'D', 'C'] as const;
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

//Create a deck
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

//Draw n cards from a deck
export function drawCards(deck: CardType[], n: number): { drawn: CardType[]; rest: CardType[] } {
  return {
    drawn: deck.slice(0, n),
    rest: deck.slice(n)
  };
}


export function dealCards(deck: CardType[], players: Player[], cardsPerPlayer: number): { hands: Record<string, CardType[]>; rest: CardType[] } {
  let rest = [...deck];
  const hands: Record<string, CardType[]> = {};
  for (const player of players) {
    const { drawn, rest: newRest } = drawCards(rest, cardsPerPlayer);
    hands[player.id] = drawn;
    rest = newRest;
  }
  return { hands, rest };
}

//Transfer cards from one hand to another
export function transferCards(
  from: CardType[],
  to: CardType[],
  cards: CardType[]
): { from: CardType[]; to: CardType[] } {
  const fromCopy = [...from];
  const toCopy = [...to, ...cards];
  for (const card of cards) {
    const idx = fromCopy.findIndex(c => c.rank === card.rank && c.suit === card.suit);
    if (idx !== -1) fromCopy.splice(idx, 1);
  }
  return { from: fromCopy, to: toCopy };
}

export function createInitialState(players: PlayerDTO[]): FishingGameState {
  const gamePlayers: Player[] = players.map((player, index) => ({
    ...player,
    isCurrentPlayer: index === 0,
  }));

  return {
    players: gamePlayers,
    currentPlayerIndex: 0,
    gameOver: false,
    winner: null,
    lastMove: null,
    playerHands: {},
    playerScores: Object.fromEntries(players.map(p => [p.id, 0])),
    playerStockpiles: Object.fromEntries(players.map(p => [p.id, []])),
    deck: [],
    discardedCards: [],
    phase: 'asking',
    currentAsk: null,
  };
}

// Helper function to check for and handle completed sets
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

export function getCardsByRank(hand: CardType[], rank: string): CardType[] {
  return hand.filter(card => card.rank === rank);
}

export function checkForCompletedSets(hand: CardType[]): string[] {
  const rankCounts: Record<string, number> = {};
  hand.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  });

  return Object.entries(rankCounts)
    .filter(([_, count]) => count === 4)
    .map(([rank]) => rank);
}

export function askForCard(
  state: FishingGameState,
  askingPlayerId: string,
  targetPlayerId: string,
  requestedRank: string
): FishingGameState {
  // Update players to mark the asking player as current
  const updatedPlayers = state.players.map(player => ({
    ...player,
    isCurrentPlayer: player.id === askingPlayerId,
  }));

  return {
    ...state,
    players: updatedPlayers,
    phase: 'showing',
    currentAsk: {
      askingPlayerId,
      targetPlayerId,
      requestedRank,
      shownCards: [], // Will be filled when target player shows cards
    },
  };
}

export function showCards(
  state: FishingGameState,
  targetPlayerId: string,
  shownCards: CardType[]
): FishingGameState {
  if (!state.currentAsk || state.currentAsk.targetPlayerId !== targetPlayerId) {
    throw new Error('Invalid show cards action');
  }

  // Update players to mark the asking player as current (they need to guess)
  const updatedPlayers = state.players.map(player => ({
    ...player,
    isCurrentPlayer: player.id === state.currentAsk!.askingPlayerId,
  }));

  return {
    ...state,
    players: updatedPlayers,
    phase: 'guessing',
    currentAsk: {
      ...state.currentAsk,
      shownCards,
    },
  };
}

export function makeGuess(
  state: FishingGameState,
  askingPlayerId: string,
  guessedSuits: string[]
): FishingGameState {
  if (!state.currentAsk || state.currentAsk.askingPlayerId !== askingPlayerId) {
    throw new Error('Invalid guess action');
  }

  const { shownCards } = state.currentAsk;
  const actualSuits = shownCards.map(card => card.suit);
  
  // Check if guess is correct (order doesn't matter)
  const guessCorrect = guessedSuits.length === actualSuits.length &&
    guessedSuits.every(suit => actualSuits.includes(suit)) &&
    actualSuits.every(suit => guessedSuits.includes(suit));

  const move: FishingMove = {
    playerId: askingPlayerId,
    playerName: state.players.find(p => p.id === askingPlayerId)?.name || 'Unknown',
    targetPlayerId: state.currentAsk.targetPlayerId,
    timestamp: new Date().toISOString(),
    requestedRank: state.currentAsk.requestedRank,
    targetPlayerCards: shownCards,
    guessedSuits,
    guessCorrect,
    cardsExchanged: guessCorrect ? shownCards : [],
  };

  // Update player hands and scores
  const newPlayerHands = { ...state.playerHands };
  const newPlayerScores = { ...state.playerScores };

  if (guessCorrect) {
    // Transfer cards from target player to asking player
    const targetHand = newPlayerHands[state.currentAsk.targetPlayerId] || [];
    const askingHand = newPlayerHands[askingPlayerId] || [];
    
    // Remove cards from target player
    const remainingCards = targetHand.filter(card => 
      !shownCards.some(shownCard => 
        shownCard.suit === card.suit && shownCard.rank === card.rank
      )
    );
    
    // Add cards to asking player
    const newAskingHand = [...askingHand, ...shownCards];
    
    newPlayerHands[state.currentAsk.targetPlayerId] = remainingCards;
    newPlayerHands[askingPlayerId] = newAskingHand;

    // Check for completed sets in asking player's hand
    const completedSets = checkForCompletedSets(newAskingHand);
    if (completedSets.length > 0) {
      // Remove completed sets and award points
      const setsToRemove = completedSets.flatMap(rank => 
        newAskingHand.filter(card => card.rank === rank)
      );
      
      newPlayerHands[askingPlayerId] = newAskingHand.filter(card => 
        !setsToRemove.some(setCard => 
          setCard.suit === card.suit && setCard.rank === card.rank
        )
      );
      
      newPlayerScores[askingPlayerId] += completedSets.length;
    }
  }

  // Determine next player
  let nextPlayerIndex = state.currentPlayerIndex;
  if (guessCorrect) {
    // Asking player gets another turn
    nextPlayerIndex = state.currentPlayerIndex;
  } else {
    // Target player gets the next turn
    const targetPlayerIndex = state.players.findIndex(p => p.id === state.currentAsk!.targetPlayerId);
    nextPlayerIndex = targetPlayerIndex;
  }

  // Update players with current player
  const updatedPlayers = state.players.map((player, index) => ({
    ...player,
    isCurrentPlayer: index === nextPlayerIndex,
  }));

  // Check if game is over (no more cards in deck and no more possible sets)
  const allHands = Object.values(newPlayerHands);
  const totalCards = allHands.reduce((sum, hand) => sum + hand.length, 0);
  const gameOver = totalCards === 0 || allHands.every(hand => hand.length === 0);

  return {
    ...state,
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    playerHands: newPlayerHands,
    playerScores: newPlayerScores,
    lastMove: move,
    phase: 'asking',
    currentAsk: null,
    gameOver,
    winner: gameOver ? getWinner(newPlayerScores) : null,
  };
}

function getWinner(scores: Record<string, number>): string | null {
  const entries = Object.entries(scores);
  if (entries.length === 0) return null;
  
  const maxScore = Math.max(...entries.map(([_, score]) => score));
  const winners = entries.filter(([_, score]) => score === maxScore);
  
  return winners.length === 1 ? winners[0][0] : null;
}

// Helper function to get a player's hand from the library
export function getPlayerHand(libraryPlayers: any[], playerId: string): CardType[] {
  const playerHand = libraryPlayers.find(p => p.id === playerId);
  return playerHand ? playerHand.cards.map((card: any) => ({
    suit: card.suit,
    rank: card.value
  })) : [];
}

// Helper function to sync game state with library state
export function syncGameStateWithLibrary(
  gameState: FishingGameState,
  libraryPlayers: any[]
): FishingGameState {
  const newPlayerHands: Record<string, CardType[]> = {};
  
  for (const player of gameState.players) {
    newPlayerHands[player.id] = getPlayerHand(libraryPlayers, player.id);
  }
  
  return {
    ...gameState,
    playerHands: newPlayerHands,
  };
}

// 6. Check for completed sets (4 of a kind) in a hand
export function getCompletedSets(hand: CardType[]): string[] {
  const rankCounts: Record<string, number> = {};
  hand.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  });
  return Object.entries(rankCounts)
    .filter(([_, count]) => count === 4)
    .map(([rank]) => rank);
}

// 7. Remove a set (all 4 cards of a rank) from a hand
export function removeSetFromHand(hand: CardType[], rank: string): CardType[] {
  return hand.filter(card => card.rank !== rank);
}

// 8. Check if deck is empty
export function isDeckEmpty(deck: CardType[]): boolean {
  return deck.length === 0;
}

// 9. Check if all hands are empty
export function areAllHandsEmpty(hands: Record<string, CardType[]>): boolean {
  return Object.values(hands).every(hand => hand.length === 0);
}