import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';

interface RoomPersistenceContextType {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  playerId: string | null;
  setPlayerId: (id: string | null) => void;
}

const RoomPersistenceContext = createContext<RoomPersistenceContextType | undefined>(undefined);

export const RoomPersistenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  // Reset context if needed - example: explicitly leaving a game
  const handleSetRoomId = (id: string | null) => {
    setRoomId(id);
    if (id === null) {
      setPlayerId(null); // Also clear player ID if room ID is cleared
    }
  };

  const value = useMemo(() => ({
    roomId,
    setRoomId: handleSetRoomId,
    playerId,
    setPlayerId,
  }), [roomId, playerId]);

  return (
    <RoomPersistenceContext.Provider value={value}>
      {children}
    </RoomPersistenceContext.Provider>
  );
};

export const useRoomPersistence = () => {
  const context = useContext(RoomPersistenceContext);
  if (context === undefined) {
    throw new Error('useRoomPersistence must be used within a RoomPersistenceProvider');
  }
  return context;
}; 