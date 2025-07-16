import { useEffect, useState } from "react";
import { useRoom } from "~/components/GameLayout";
import {
  createDeck,
  shuffleDeck,
  dealCards,
  checkAndHandleCompletedSets,
  checkGameOver,
  passTurn,
  passTurnToNextPlayerWithCards,
} from "../gameLogic";
import { sortHand } from "~/utils/cardUtils";
import type { FishingGameState, CardType } from "../types";

export function useFishingGame() {
  const { playerId, players: roomPlayers, latestState, pushState, roomId } = useRoom();
  const [gameStarted, setGameStarted] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [showGuessPopup, setShowGuessPopup] = useState(false);
  const [guessedSuits, setGuessedSuits] = useState<string[]>([]);
  const [showCardSelection, setShowCardSelection] = useState(false);
  const [currentAsk, setCurrentAsk] = useState<{
    targetPlayerId: string;
    targetPlayerName: string;
    requestedRank: string;
    shownCards: CardType[];
  } | null>(null);
  const [showLastMove, setShowLastMove] = useState(false);
  const [isProcessingAsk, setIsProcessingAsk] = useState(false);

  const allPlayers = (roomPlayers as any[]).some((p: any) => p.id === playerId)
    ? (roomPlayers as any[]).map((p: any) => ({ ...p, isCurrentPlayer: p.isCurrentPlayer ?? false }))
    : [...(roomPlayers as any[]).map((p: any) => ({ ...p, isCurrentPlayer: p.isCurrentPlayer ?? false })), { id: playerId!, name: "You", joinedAt: new Date().toISOString(), isCurrentPlayer: false }];

  const isHost = allPlayers.length > 0 && allPlayers[0].id === playerId;

  useEffect(() => {
    const fetchRoomCode = async () => {
      if (!roomId) return;
      try {
        const response = await fetch(`/api?action=getRoomCode&roomId=${roomId}`);
        if (response.ok) {
          const data = await response.json();
          setRoomCode(data.code);
        }
      } catch (err) {
        console.error("Failed to fetch room code:", err);
      }
    };
    fetchRoomCode();
  }, [roomId]);

  useEffect(() => {
    if (selectedRank && selectedPlayer && !showCardSelection && !isProcessingAsk) {
      handleAskForCards();
    }
  }, [selectedRank, selectedPlayer, showCardSelection, isProcessingAsk]);

  useEffect(() => {
    if (latestState && (latestState as FishingGameState).lastMove) {
      setShowLastMove(true);
      const timer = setTimeout(() => {
        setShowLastMove(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [latestState]);

  const handleStartGame = () => {
    let deck = createDeck();
    deck = shuffleDeck(deck);
    const playerObjs = allPlayers.map((p) => ({ ...p, isCurrentPlayer: false }));
    const { hands, rest } = dealCards(deck, playerObjs, 5);
    const startingIndex = Math.floor(Math.random() * allPlayers.length);
    const { playerHands, playerScores, playerStockpiles } = checkAndHandleCompletedSets(
      hands,
      Object.fromEntries(allPlayers.map(p => [p.id, 0])),
      Object.fromEntries(allPlayers.map(p => [p.id, []]))
    );
    const newState: FishingGameState = {
      players: allPlayers.map((p, i) => ({ ...p, isCurrentPlayer: i === startingIndex })),
      currentPlayerIndex: startingIndex,
      gameOver: false,
      winner: null,
      lastMove: null,
      playerHands,
      playerScores,
      playerStockpiles,
      deck: rest,
      discardedCards: [],
      phase: "asking",
      currentAsk: null,
    };
    pushState(newState);
    setGameStarted(true);
  };

  const handleNewGame = () => {
    handleStartGame();
  };

  const handlePlayerClick = (targetPlayerId: string, targetPlayerName?: string) => {
    if (!isMyTurn || !playerId) return;
    setSelectedPlayer(targetPlayerId);
    setSelectedRank("");
    setShowCardSelection(true);
  };

  const handleCardSelect = (rank: string) => {
    setSelectedRank(rank);
    setShowCardSelection(false);
  };
  const handleAskForCards = () => {
    if (!selectedRank || !selectedPlayer || !latestState || !playerId) return;
    const state = latestState as FishingGameState;
    if (!state.playerHands || !state.players || !state.deck) return;
    
    // Prevent duplicate calls
    if (showGuessPopup || currentAsk || isProcessingAsk) {
      return;
    }
    
    setIsProcessingAsk(true);
    const targetHand = state.playerHands[selectedPlayer] || [];
    const matchingCards = targetHand.filter(card => card.rank === selectedRank);
    
    // Case 1: No cards found - draw a card and pass turn
    if (matchingCards.length === 0) {
      let newState = { ...state };
      
      if (newState.deck.length > 0) {
        const drawnCard = newState.deck.pop()!;
        newState.playerHands[playerId] = [...(newState.playerHands[playerId] || []), drawnCard];
        
        // Check for completed sets after drawing
        const { playerHands, playerScores, playerStockpiles } = checkAndHandleCompletedSets(
          newState.playerHands,
          newState.playerScores,
          newState.playerStockpiles
        );
        newState.playerHands = playerHands;
        newState.playerScores = playerScores;
        newState.playerStockpiles = playerStockpiles;
      }
      
      const askingPlayerName = allPlayers.find(p => p.id === playerId)?.name || "Unknown";
      newState.lastMove = {
        playerId,
        playerName: askingPlayerName,
        targetPlayerId: selectedPlayer,
        timestamp: new Date().toISOString(),
        requestedRank: selectedRank,
        targetPlayerCards: [],
        guessedSuits: null,
        guessCorrect: null,
        cardsExchanged: []
      };
      
      // Always pass turn to next player when drawing a card (even if a set was completed)
      newState = passTurnToNextPlayerWithCards(newState);
      
      // Check for game over
      const { gameOver, winner } = checkGameOver(newState);
      newState.gameOver = gameOver;
      newState.winner = winner;
      
      pushState(newState);
      setSelectedRank("");
      setSelectedPlayer("");
      setIsProcessingAsk(false);
      return;
    }
    
    // Case 2: Cards found
    if (matchingCards.length > 0) {
      // Case 2a: Asking player has 3 cards of this rank and target has the 4th - automatically transfer
      const askingPlayerHand = state.playerHands[playerId] || [];
      const askingPlayerCardsOfRank = askingPlayerHand.filter(card => card.rank === selectedRank);
      
      if (askingPlayerCardsOfRank.length === 3 && matchingCards.length === 1) {
        let newState = { ...state };
        // Transfer the 4th card to asking player
        newState.playerHands[playerId] = [...(newState.playerHands[playerId] || []), ...matchingCards];
        // Remove the card from target player
        newState.playerHands[selectedPlayer] = targetHand.filter(card => 
          !(card.rank === selectedRank && card.suit === matchingCards[0].suit)
        );
        
        // Check for completed sets after transfer
        const { playerHands, playerScores, playerStockpiles } = checkAndHandleCompletedSets(
          newState.playerHands,
          newState.playerScores,
          newState.playerStockpiles
        );
        newState.playerHands = playerHands;
        newState.playerScores = playerScores;
        newState.playerStockpiles = playerStockpiles;
        
        // Record the move
        const askingPlayerName = allPlayers.find(p => p.id === playerId)?.name || "Unknown";
        newState.lastMove = {
          playerId,
          playerName: askingPlayerName,
          targetPlayerId: selectedPlayer,
          timestamp: new Date().toISOString(),
          requestedRank: selectedRank,
          targetPlayerCards: matchingCards,
          guessedSuits: null,
          guessCorrect: true,
          cardsExchanged: matchingCards
        };
        
        // Pass turn if player has no cards left (regardless of deck)
        if (newState.playerHands[playerId].length === 0) {
          newState = passTurnToNextPlayerWithCards(newState);
        }
        
        // Check for game over
        const { gameOver, winner } = checkGameOver(newState);
        newState.gameOver = gameOver;
        newState.winner = winner;
        
        pushState(newState);
        setSelectedRank("");
        setSelectedPlayer("");
        setIsProcessingAsk(false);
        return;
      }
      
      // Case 2b: Some cards found (1-3) - show guess dialog
      setCurrentAsk({
        targetPlayerId: selectedPlayer,
        targetPlayerName: allPlayers.find(p => p.id === selectedPlayer)?.name || "Unknown",
        requestedRank: selectedRank,
        shownCards: matchingCards,
      });
      setGuessedSuits([]);
      setShowGuessPopup(true);
    } else {
      // If somehow we get here with 0 cards, close any open dialogs
      setShowGuessPopup(false);
      setCurrentAsk(null);
    }
    setSelectedRank("");
    setSelectedPlayer("");
    setIsProcessingAsk(false);
  };

  const handleGuessSuits = () => {
    if (!currentAsk || !latestState || !playerId) {
      setIsProcessingAsk(false);
      return;
    }
    const state = latestState as FishingGameState;
    let newState = { ...state };
    
    // Find correctly guessed cards
    const correctGuesses = guessedSuits.filter(guessedSuit => 
      currentAsk.shownCards.some(card => card.suit === guessedSuit)
    );
    const correctlyGuessedCards = currentAsk.shownCards.filter(card => 
      correctGuesses.includes(card.suit)
    );
    
    // Calculate if player guessed ALL cards correctly
    const guessedAllCorrectly = correctlyGuessedCards.length === currentAsk.shownCards.length;
    
    // Transfer correctly guessed cards
    if (correctlyGuessedCards.length > 0) {
      // Add cards to asking player's hand
      newState.playerHands[playerId] = [...(newState.playerHands[playerId] || []), ...correctlyGuessedCards];
      
      // Remove cards from target player's hand
      newState.playerHands[currentAsk.targetPlayerId] = newState.playerHands[currentAsk.targetPlayerId].filter(card => 
        !correctlyGuessedCards.some(guessedCard => 
          guessedCard.rank === card.rank && guessedCard.suit === card.suit
        )
      );
    }
    
    // Draw a card if not all guesses were correct
    if (newState.deck.length > 0 && !guessedAllCorrectly) {
      const drawnCard = newState.deck.pop()!;
      newState.playerHands[playerId] = [...(newState.playerHands[playerId] || []), drawnCard];
    }
    
    // Check for completed sets after all changes
    const { playerHands, playerScores, playerStockpiles } = checkAndHandleCompletedSets(
      newState.playerHands,
      newState.playerScores,
      newState.playerStockpiles
    );
    newState.playerHands = playerHands;
    newState.playerScores = playerScores;
    newState.playerStockpiles = playerStockpiles;
    
    // Turn logic: 
    // - Pass turn if:
    //   1. Player didn't guess all cards correctly, or
    //   2. Player has no cards left (regardless of deck)
    if (!guessedAllCorrectly || newState.playerHands[playerId].length === 0) {
      newState = passTurnToNextPlayerWithCards(newState);
    }
    
    // Check for game over
    const { gameOver, winner } = checkGameOver(newState);
    newState.gameOver = gameOver;
    newState.winner = winner;
    
    // Record the move
    const askingPlayerName = allPlayers.find(p => p.id === playerId)?.name || "Unknown";
    newState.lastMove = {
      playerId,
      playerName: askingPlayerName,
      targetPlayerId: currentAsk.targetPlayerId,
      timestamp: new Date().toISOString(),
      requestedRank: currentAsk.requestedRank,
      targetPlayerCards: currentAsk.shownCards,
      guessedSuits: guessedSuits,
      guessCorrect: guessedAllCorrectly,
      cardsExchanged: correctlyGuessedCards
    };
    
    pushState(newState);
    setShowGuessPopup(false);
    setCurrentAsk(null);
    setGuessedSuits([]);
    setIsProcessingAsk(false);
  };

  const handleSuitToggle = (suit: string) => {
    setGuessedSuits(prev => 
      prev.includes(suit) 
        ? prev.filter(s => s !== suit)
        : [...prev, suit]
    );
  };

  const handleGuessDialogClose = (open: boolean) => {
    if (!open) {
      // Dialog is being closed, treat it as a wrong guess to prevent information leakage
      if (currentAsk && latestState && playerId) {
        const state = latestState as FishingGameState;
        let newState = { ...state };
        
        // Draw a card since the guess was wrong (canceled)
        if (newState.deck.length > 0) {
          const drawnCard = newState.deck.pop()!;
          newState.playerHands[playerId] = [...(newState.playerHands[playerId] || []), drawnCard];
        }
        
        // Check for completed sets after drawing
        const { playerHands, playerScores, playerStockpiles } = checkAndHandleCompletedSets(
          newState.playerHands,
          newState.playerScores,
          newState.playerStockpiles
        );
        newState.playerHands = playerHands;
        newState.playerScores = playerScores;
        newState.playerStockpiles = playerStockpiles;
        
        // Pass turn to next player since guess was wrong
        newState = passTurn(newState);
        
        // Check for game over
        const { gameOver, winner } = checkGameOver(newState);
        newState.gameOver = gameOver;
        newState.winner = winner;
        
        // Record the move as a wrong guess
        const askingPlayerName = allPlayers.find(p => p.id === playerId)?.name || "Unknown";
        newState.lastMove = {
          playerId,
          playerName: askingPlayerName,
          targetPlayerId: currentAsk.targetPlayerId,
          timestamp: new Date().toISOString(),
          requestedRank: currentAsk.requestedRank,
          targetPlayerCards: currentAsk.shownCards,
          guessedSuits: guessedSuits,
          guessCorrect: false,
          cardsExchanged: []
        };
        
        pushState(newState);
      }
      
      // Reset all states
      setShowGuessPopup(false);
      setCurrentAsk(null);
      setGuessedSuits([]);
      setIsProcessingAsk(false);
    }
  };



  useEffect(() => {
    if (
      latestState &&
      (latestState as FishingGameState).playerHands &&
      Object.keys((latestState as FishingGameState).playerHands).length > 0
    ) {
      setGameStarted(true);
    } else {
      setGameStarted(false);
    }
  }, [latestState]);

  const gameState = gameStarted && latestState ? (latestState as FishingGameState) : null;



  const myHand = gameState && playerId && gameState.playerHands 
    ? sortHand(gameState.playerHands[playerId] || [])
    : [];
  const currentPlayerId = gameState && gameState.players 
    ? gameState.players[gameState.currentPlayerIndex]?.id || ""
    : "";
  const currentPlayerName = gameState && gameState.players 
    ? gameState.players[gameState.currentPlayerIndex]?.name || ""
    : "";
  const isMyTurn = currentPlayerId === playerId;
  const availableRanks = [...new Set(myHand.map(card => card.rank))];
  const playerStockpiles = gameState?.playerStockpiles || {};
  const displayHand = (hand: CardType[]) => hand;

  return {
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
  };
} 