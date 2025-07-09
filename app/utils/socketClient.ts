import { io, Socket } from "socket.io-client";

// Get socket URL from environment variable exposed via window.ENV
const SOCKET_URL = typeof window !== 'undefined' && window.ENV?.SOCKET_URL 
  ? window.ENV.SOCKET_URL 
  : "https://socket.stormyfocus.cloud";

let socket: Socket | null = null;
//handling disconnects and reconnections
let socketInitialized = false;
let lastRoomId: string | null = null;
let lastPlayerId: string | null = null;
let lastPlayerName: string | undefined = undefined;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 20000,
      transports: ["websocket", "polling"],
    });
    socketInitialized = false;
  }

  // Ensure event listeners are set up only once per socket instance
  if (socket && !socketInitialized) {
    socket.on("connect", () => {
      console.log(`SocketClient: Connected to server. Socket ID: ${socket?.id}.`);
      // Attempt to re-join if we have previous room details
      if (lastRoomId && lastPlayerId) {
        console.log(
          `SocketClient: Re-connected. Attempting to re-join room: ${lastRoomId} as player: ${lastPlayerId}`
        );
        socket?.emit("joinRoom", {
          roomId: lastRoomId,
          playerId: lastPlayerId,
          playerName: lastPlayerName,
        });
      }
    });

    socket.on("disconnect", (reason: string) => {
      console.warn(
        `SocketClient: Disconnected from server. Reason: ${reason}.`
      );
    });

    socket.on("connect_error", (err: Error) => {
      console.error(
        `SocketClient: Connection error. Message: ${err.message}.`
      );
    });

    socket.on("reconnect_attempt", (attemptNumber: number) => {
      console.log(`SocketClient: Reconnect attempt #${attemptNumber}...`);
    });

    socket.on("reconnect", (attemptNumber: number) => {
      console.log(
        `SocketClient: Successfully reconnected after ${attemptNumber} attempts.`
      );
    });

    socket.on("reconnect_error", (err: Error) => {
      console.error(
        `SocketClient: Reconnection error. Message: ${err.message}`
      );
    });

    socket.on("reconnect_failed", () => {
      console.error(
        "SocketClient: Failed to reconnect after all attempts."
      );
    });

    socket.on("joinError", (errorMessage: string) => {
      console.error(
        `SocketClient: Error joining room: ${errorMessage}`
      );
    });

    socketInitialized = true;
  }
  return socket as Socket;
}

export function joinRoom(
  roomId: string,
  playerId: string,
  playerName?: string
): void {
  // Store details for potential re-join
  lastRoomId = roomId;
  lastPlayerId = playerId;
  lastPlayerName = playerName;
  console.log(
    `SocketClient: Joining room ${roomId} as player ${playerId}`
  );
  getSocket().emit("joinRoom", { roomId, playerId, playerName });
}

export function pushState(roomId: string, state: any): void {
  getSocket().emit("pushState", { roomId, state });
}

export function onGameState(callback: (state: any) => void): void {
  getSocket().on("gameState", callback);
}

export function offGameState(callback: (state: any) => void): void {
  getSocket().off("gameState", callback);
}

export function onPlayersUpdate(callback: (players: string[]) => void): void {
  getSocket().on("playersUpdate", callback);
}

export function offPlayersUpdate(callback: (players: string[]) => void): void {
  getSocket().off("playersUpdate", callback);
}

export function leaveRoom(roomId: string, playerId: string): void {
  console.log(
    `SocketClient: Leaving room ${roomId} as player ${playerId}`
  );
  getSocket().emit("leaveRoom", { roomId, playerId });
  if (roomId === lastRoomId && playerId === lastPlayerId) {
    lastRoomId = null;
    lastPlayerId = null;
    lastPlayerName = undefined;
  }
}

/**
 * Call this function to explicitly disconnect the socket, for example,
 * when a user logs out or leaves the game application entirely.
 */
export function disconnectSocket(): void {
  const currentSocket = getSocket();
  if (currentSocket && currentSocket.connected) {
    console.log("SocketClient: Manually disconnecting socket.");
    currentSocket.disconnect();
  }
  socket = null;
  socketInitialized = false;
  lastRoomId = null;
  lastPlayerId = null;
  lastPlayerName = undefined;
}
